import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { ArrowRight, Search, X } from "lucide-react";

const DEFAULT_MAX_RESULTS = 10;
const MAX_CONTEXT_ENTRIES = 600;
const BACKEND_MIN_QUERY_LENGTH = 1;
const BACKEND_DEBOUNCE_MS = 220;
const BACKEND_FETCH_LIMIT = 24;
const REF_PATTERN = /\b[A-Z]{1,5}-[A-Z0-9]{4,}\b/g;
const SEARCH_HIGHLIGHT_CLASS = "dashboard-search-target-highlight";
const SEARCH_HIGHLIGHT_STYLE_ID = "dashboard-search-target-highlight-style";
const SEARCH_PENDING_TARGET_STORAGE_KEY = "dashboard-search-pending-target";
const SEARCH_HIGHLIGHT_DURATION_MS = 2200;
const SEARCH_REVEAL_RETRY_MS = 120;
const SEARCH_REVEAL_MAX_ATTEMPTS = 18;
const SEARCH_TEXT_MATCH_SELECTORS = [
    "main h1",
    "main h2",
    "main h3",
    "main h4",
    "main h5",
    "main h6",
    "main [data-search-title]",
    "main [role='tab']",
    "main [role='heading']",
    "main th",
    "main td",
    "main label",
    "main button",
    "main a[href]",
    "main p",
    "main li",
    "main span",
];

const STATIC_SKIP_TERMS = new Set([
    "save",
    "cancel",
    "apply",
    "close",
    "edit",
    "delete",
    "view",
    "export",
    "filters",
    "search",
    "logout",
]);

let contextAnchorCounter = 0;

const normalizeSearchValue = (value) => String(value || "").toLowerCase().trim();
const normalizeHashId = (hash) => String(hash || "").replace(/^#/, "").trim();

const splitPathAndHash = (pathValue) => {
    const rawValue = String(pathValue || "");
    const hashIndex = rawValue.indexOf("#");

    if (hashIndex === -1) {
        return [rawValue, ""];
    }

    return [rawValue.slice(0, hashIndex), rawValue.slice(hashIndex + 1)];
};

const normalizePathOnly = (pathValue) => String(pathValue || "").split("?")[0] || "";

const ensureHighlightStyles = () => {
    if (typeof document === "undefined") {
        return;
    }

    if (document.getElementById(SEARCH_HIGHLIGHT_STYLE_ID)) {
        return;
    }

    const styleTag = document.createElement("style");
    styleTag.id = SEARCH_HIGHLIGHT_STYLE_ID;
    styleTag.textContent = `
        @keyframes dashboard-search-target-pulse {
            0% { box-shadow: 0 0 0 0 rgba(9, 85, 172, 0.30); }
            70% { box-shadow: 0 0 0 8px rgba(9, 85, 172, 0); }
            100% { box-shadow: 0 0 0 0 rgba(9, 85, 172, 0); }
        }

        .${SEARCH_HIGHLIGHT_CLASS} {
            scroll-margin-top: 120px;
            outline: 2px solid #0955AC !important;
            outline-offset: 4px;
            background: rgba(9, 85, 172, 0.08) !important;
            border-radius: 10px;
            animation: dashboard-search-target-pulse 900ms ease-out 2;
            transition: background 220ms ease-out, outline-color 220ms ease-out;
        }
    `;

    document.head.appendChild(styleTag);
};

const savePendingTarget = ({ path, hash = "", searchText = "" }) => {
    if (typeof window === "undefined") {
        return;
    }

    const normalizedHash = normalizeHashId(hash);
    const normalizedSearchText = String(searchText || "").trim();
    const normalizedPath = String(path || "");

    if (!normalizedPath || (!normalizedHash && !normalizedSearchText)) {
        return;
    }

    try {
        window.sessionStorage.setItem(
            SEARCH_PENDING_TARGET_STORAGE_KEY,
            JSON.stringify({
                path: normalizedPath,
                hash: normalizedHash,
                searchText: normalizedSearchText,
                createdAt: Date.now(),
            })
        );
    } catch (_error) {
        // Ignore storage exceptions (private mode / blocked storage).
    }
};

const readPendingTarget = () => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const rawValue = window.sessionStorage.getItem(SEARCH_PENDING_TARGET_STORAGE_KEY);
        if (!rawValue) {
            return null;
        }

        const parsed = JSON.parse(rawValue);
        if (!parsed || typeof parsed !== "object") {
            return null;
        }

        const path = String(parsed.path || "");
        const hash = normalizeHashId(parsed.hash);
        const searchText = String(parsed.searchText || "").trim();
        const createdAt = Number(parsed.createdAt || 0);

        if (!path || (!hash && !searchText) || !Number.isFinite(createdAt)) {
            return null;
        }

        return { path, hash, searchText, createdAt };
    } catch (_error) {
        return null;
    }
};

const clearPendingTarget = () => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.sessionStorage.removeItem(SEARCH_PENDING_TARGET_STORAGE_KEY);
    } catch (_error) {
        // Ignore storage exceptions.
    }
};

const toTitleCase = (value) =>
    String(value || "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());

const slugify = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const buildSearchTokens = (query) =>
    normalizeSearchValue(query)
        .split(/\s+/)
        .filter(Boolean);

const elementIsVisible = (element) => {
    if (!element || typeof window === "undefined") {
        return false;
    }

    const style = window.getComputedStyle(element);

    return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity || "1") > 0 &&
        element.getClientRects().length > 0
    );
};

const ensureElementAnchor = (element, baseTitle) => {
    if (!element) {
        return null;
    }

    if (!element.id) {
        contextAnchorCounter += 1;
        element.id = `search-target-${slugify(baseTitle).slice(0, 40)}-${contextAnchorCounter}`;
    }

    return element.id;
};

const normalizeHrefToPath = (href) => {
    if (!href || typeof window === "undefined") {
        return null;
    }

    if (href.startsWith("#")) {
        return `${window.location.pathname}${href}`;
    }

    try {
        const url = new URL(href, window.location.origin);
        return `${url.pathname}${url.hash || ""}`;
    } catch (_error) {
        return null;
    }
};

const buildCurrentPageContextItems = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return [];
    }

    const path = window.location.pathname;
    const entries = [];
    const dedupe = new Set();
    const pushEntry = (entry) => {
        if (!entry?.title || !entry?.path) {
            return;
        }

        const key = `${entry.title.toLowerCase()}::${entry.path}`;

        if (dedupe.has(key)) {
            return;
        }

        dedupe.add(key);
        entries.push(entry);
    };

    const pageHeading =
        document.querySelector("main h1, h1")?.textContent?.trim() ||
        toTitleCase(path.split("/").filter(Boolean).pop() || "Current Page");

    const selectors = [
        "main h1",
        "main h2",
        "main h3",
        "main h4",
        "main h5",
        "main h6",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "label",
        "th",
        "td",
        "li",
        "p",
        "span",
        "[role='tab']",
        "[role='heading']",
        "[data-search-title]",
        "button",
        "a[href]",
    ];

    const elements = Array.from(document.querySelectorAll(selectors.join(",")));

    elements.forEach((element) => {
        if (!elementIsVisible(element)) {
            return;
        }

        const rawText = element.textContent || "";
        const title = rawText.replace(/\s+/g, " ").trim();
        const normalized = normalizeSearchValue(title);

        if (title.length < 3 || title.length > 90) {
            return;
        }

        if (!/[a-zA-Z]/.test(title)) {
            return;
        }

        if (STATIC_SKIP_TERMS.has(normalized)) {
            return;
        }

        let resultPath = null;

        if (element.tagName === "A") {
            resultPath = normalizeHrefToPath(element.getAttribute("href"));
        }

        if (!resultPath) {
            const anchorId = ensureElementAnchor(element, title);
            if (!anchorId) {
                return;
            }

            resultPath = `${path}#${anchorId}`;
        }

        const isSidebar = Boolean(element.closest("aside, nav"));
        const isHeader = Boolean(element.closest("header"));

        pushEntry({
            id: `context-${slugify(title)}-${slugify(resultPath)}`,
            title,
            path: resultPath,
            manualPath: `${pageHeading} > ${title}`,
            group: isSidebar ? "Navigation" : isHeader ? "Header" : "Section",
            description: "Found in the current page content.",
            keywords: [title, pageHeading, "current page"],
        });
    });

    const bodyText = document.body?.innerText || "";
    const references = Array.from(new Set(bodyText.match(REF_PATTERN) || []));

    references.slice(0, 40).forEach((reference) => {
        pushEntry({
            id: `context-ref-${slugify(reference)}-${slugify(path)}`,
            title: reference,
            path,
            manualPath: `${pageHeading} > Records`,
            group: "Records",
            description: "Reference ID found on the current page.",
            keywords: [reference, "reference", "tracking", "booking"],
        });
    });

    return entries.slice(0, MAX_CONTEXT_ENTRIES);
};

const toHaystack = (item) => {
    const searchableValues = [
        item?.title,
        item?.description,
        item?.group,
        item?.manualPath,
        item?.path,
        ...(Array.isArray(item?.keywords) ? item.keywords : []),
    ];

    return searchableValues.join(" ").toLowerCase();
};

const scoreItem = (item, query, tokens) => {
    const normalizedQuery = normalizeSearchValue(query);
    const title = normalizeSearchValue(item?.title);
    const manualPath = normalizeSearchValue(item?.manualPath);
    const path = normalizeSearchValue(item?.path);
    const keywords = Array.isArray(item?.keywords)
        ? item.keywords.map((keyword) => normalizeSearchValue(keyword))
        : [];
    const haystack = toHaystack(item);

    if (!tokens.every((token) => haystack.includes(token))) {
        return -1;
    }

    let score = 0;

    if (title.startsWith(normalizedQuery)) {
        score += 140;
    } else if (title.includes(normalizedQuery)) {
        score += 100;
    }

    if (manualPath.includes(normalizedQuery)) {
        score += 40;
    }

    if (path.includes(normalizedQuery)) {
        score += 20;
    }

    keywords.forEach((keyword) => {
        if (keyword.startsWith(normalizedQuery)) {
            score += 14;
        } else if (normalizedQuery && keyword.includes(normalizedQuery)) {
            score += 8;
        }
    });

    score += Math.max(0, 30 - title.length / 4);

    return score;
};

const DashboardSearchModal = ({
    isOpen,
    onClose,
    items = [],
    title = "Search Dashboard",
    placeholder = "Search for pages, tools, and settings",
    emptyStateMessage = "No matching results. Try broader keywords.",
    maxResults = DEFAULT_MAX_RESULTS,
}) => {
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [contextItems, setContextItems] = useState([]);
    const [backendItems, setBackendItems] = useState([]);
    const [isBackendLoading, setIsBackendLoading] = useState(false);
    const [backendError, setBackendError] = useState("");
    const inputRef = useRef(null);
    const backendAbortRef = useRef(null);
    const highlightTimeoutRef = useRef(null);
    const revealAttemptTimeoutRef = useRef(null);
    const highlightedElementRef = useRef(null);
    const revealRequestRef = useRef(0);

    const clearCurrentHighlight = useCallback(() => {
        if (highlightTimeoutRef.current) {
            window.clearTimeout(highlightTimeoutRef.current);
            highlightTimeoutRef.current = null;
        }

        if (highlightedElementRef.current) {
            highlightedElementRef.current.classList.remove(SEARCH_HIGHLIGHT_CLASS);
            highlightedElementRef.current = null;
        }
    }, []);

    const revealHashTarget = useCallback(
        (hash, { smooth = true, replaceHistory = true } = {}) => {
            if (typeof window === "undefined" || typeof document === "undefined") {
                return false;
            }

            const normalizedHash = normalizeHashId(hash);
            if (!normalizedHash) {
                return false;
            }

            const targetElement = document.getElementById(normalizedHash);
            if (!targetElement) {
                return false;
            }

            clearCurrentHighlight();

            targetElement.scrollIntoView({
                behavior: smooth ? "smooth" : "auto",
                block: "center",
                inline: "nearest",
            });

            if (replaceHistory) {
                window.history.replaceState(
                    {},
                    "",
                    `${window.location.pathname}${window.location.search}#${normalizedHash}`
                );
            }

            targetElement.classList.add(SEARCH_HIGHLIGHT_CLASS);
            highlightedElementRef.current = targetElement;

            highlightTimeoutRef.current = window.setTimeout(() => {
                if (highlightedElementRef.current) {
                    highlightedElementRef.current.classList.remove(SEARCH_HIGHLIGHT_CLASS);
                    highlightedElementRef.current = null;
                }
                highlightTimeoutRef.current = null;
            }, SEARCH_HIGHLIGHT_DURATION_MS);

            return true;
        },
        [clearCurrentHighlight]
    );

    const revealHashTargetWithRetry = useCallback(
        (hash, options = {}) => {
            if (typeof window === "undefined") {
                return;
            }

            const normalizedHash = normalizeHashId(hash);
            if (!normalizedHash) {
                return;
            }

            if (revealAttemptTimeoutRef.current) {
                window.clearTimeout(revealAttemptTimeoutRef.current);
                revealAttemptTimeoutRef.current = null;
            }

            revealRequestRef.current += 1;
            const requestId = revealRequestRef.current;
            const maxAttempts = Number(options.maxAttempts || SEARCH_REVEAL_MAX_ATTEMPTS);

            const attemptReveal = (attemptIndex) => {
                if (revealRequestRef.current !== requestId) {
                    return;
                }

                const didReveal = revealHashTarget(normalizedHash, options);
                if (didReveal || attemptIndex >= maxAttempts) {
                    return;
                }

                revealAttemptTimeoutRef.current = window.setTimeout(() => {
                    attemptReveal(attemptIndex + 1);
                }, SEARCH_REVEAL_RETRY_MS);
            };

            attemptReveal(1);
        },
        [revealHashTarget]
    );

    const revealTextTarget = useCallback(
        (searchText, options = {}) => {
            if (typeof document === "undefined") {
                return false;
            }

            const normalizedText = normalizeSearchValue(searchText);
            if (!normalizedText) {
                return false;
            }

            const tokens = buildSearchTokens(normalizedText);
            if (tokens.length === 0) {
                return false;
            }

            const candidates = Array.from(
                document.querySelectorAll(SEARCH_TEXT_MATCH_SELECTORS.join(","))
            );

            let bestElement = null;
            let bestScore = -1;

            candidates.forEach((element) => {
                if (!elementIsVisible(element)) {
                    return;
                }

                const rawText = String(element.textContent || "").replace(/\s+/g, " ").trim();
                if (rawText.length < 2 || rawText.length > 140) {
                    return;
                }

                const haystack = normalizeSearchValue(rawText);
                if (!tokens.every((token) => haystack.includes(token))) {
                    return;
                }

                let score = 0;

                if (haystack === normalizedText) {
                    score += 260;
                } else if (haystack.startsWith(normalizedText)) {
                    score += 190;
                } else if (haystack.includes(normalizedText)) {
                    score += 120;
                }

                if (/^h[1-6]$/i.test(element.tagName)) {
                    score += 40;
                }

                if (element.tagName === "TH" || element.tagName === "LABEL") {
                    score += 24;
                }

                score += Math.max(0, 40 - Math.floor(rawText.length / 2));

                if (score > bestScore) {
                    bestScore = score;
                    bestElement = element;
                }
            });

            if (!bestElement) {
                return false;
            }

            const anchorId = ensureElementAnchor(bestElement, normalizedText);
            if (!anchorId) {
                return false;
            }

            return revealHashTarget(anchorId, options);
        },
        [revealHashTarget]
    );

    const revealTextTargetWithRetry = useCallback(
        (searchText, options = {}) => {
            if (typeof window === "undefined") {
                return;
            }

            const normalizedSearchText = String(searchText || "").trim();
            if (!normalizedSearchText) {
                return;
            }

            if (revealAttemptTimeoutRef.current) {
                window.clearTimeout(revealAttemptTimeoutRef.current);
                revealAttemptTimeoutRef.current = null;
            }

            revealRequestRef.current += 1;
            const requestId = revealRequestRef.current;
            const maxAttempts = Number(options.maxAttempts || SEARCH_REVEAL_MAX_ATTEMPTS);

            const attemptReveal = (attemptIndex) => {
                if (revealRequestRef.current !== requestId) {
                    return;
                }

                const didReveal = revealTextTarget(normalizedSearchText, options);
                if (didReveal || attemptIndex >= maxAttempts) {
                    return;
                }

                revealAttemptTimeoutRef.current = window.setTimeout(() => {
                    attemptReveal(attemptIndex + 1);
                }, SEARCH_REVEAL_RETRY_MS);
            };

            attemptReveal(1);
        },
        [revealTextTarget]
    );

    const baseItems = useMemo(() => {
        const dedupe = new Set();
        return [...items, ...contextItems].filter((item) => {
            if (!item?.title || !item?.path) {
                return false;
            }

            const key = `${item.title.toLowerCase()}::${item.path}`;
            if (dedupe.has(key)) {
                return false;
            }

            dedupe.add(key);
            return true;
        });
    }, [items, contextItems]);

    const allItems = useMemo(() => {
        const dedupe = new Set();
        return [...baseItems, ...backendItems].filter((item) => {
            if (!item?.title || !item?.path) {
                return false;
            }

            const key = `${item.title.toLowerCase()}::${item.path}`;
            if (dedupe.has(key)) {
                return false;
            }

            dedupe.add(key);
            return true;
        });
    }, [baseItems, backendItems]);

    const visibleItems = useMemo(() => {
        if (!query.trim()) {
            return allItems.slice(0, maxResults);
        }

        const tokens = buildSearchTokens(query);

        const localMatches = baseItems
            .map((item) => ({
                item,
                score: scoreItem(item, query, tokens),
            }))
            .filter((entry) => entry.score >= 0)
            .sort((left, right) => right.score - left.score);

        // Keep backend matches even if local token rules are stricter than backend
        // ranking (e.g. typo-tolerant engine matches).
        const backendMatches = backendItems.map((item, index) => ({
            item,
            score: 1000 - index,
        }));

        const combined = [...backendMatches, ...localMatches];
        const dedupe = new Set();
        const result = [];

        combined.forEach((entry) => {
            if (!entry?.item?.title || !entry?.item?.path) {
                return;
            }

            const key = `${entry.item.title.toLowerCase()}::${entry.item.path}`;
            if (dedupe.has(key)) {
                return;
            }

            dedupe.add(key);
            result.push(entry.item);
        });

        return result.slice(0, maxResults);
    }, [allItems, baseItems, backendItems, query, maxResults]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setQuery("");
        setActiveIndex(0);
        setContextItems(buildCurrentPageContextItems());
        setBackendItems([]);
        setBackendError("");
        setIsBackendLoading(false);
        backendAbortRef.current?.abort?.();
        backendAbortRef.current = null;

        const focusTimer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 20);

        return () => {
            window.clearTimeout(focusTimer);
            backendAbortRef.current?.abort?.();
            backendAbortRef.current = null;
        };
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose?.();
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const normalizedQuery = query.trim();

        if (normalizedQuery.length < BACKEND_MIN_QUERY_LENGTH) {
            backendAbortRef.current?.abort?.();
            backendAbortRef.current = null;
            setBackendItems([]);
            setBackendError("");
            setIsBackendLoading(false);
            return;
        }

        let localController = null;

        const timer = window.setTimeout(async () => {
            backendAbortRef.current?.abort?.();

            const controller = new AbortController();
            localController = controller;
            backendAbortRef.current = controller;

            setIsBackendLoading(true);
            setBackendError("");

            try {
                let payload = null;

                if (typeof window !== "undefined" && window.axios?.get) {
                    const response = await window.axios.get("/api/dashboard/global-search", {
                        params: {
                            q: normalizedQuery,
                            limit: BACKEND_FETCH_LIMIT,
                        },
                        signal: controller.signal,
                        headers: {
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    });

                    payload = response?.data;
                } else {
                    const response = await fetch(
                        `/api/dashboard/global-search?q=${encodeURIComponent(normalizedQuery)}&limit=${BACKEND_FETCH_LIMIT}`,
                        {
                            method: "GET",
                            credentials: "same-origin",
                            signal: controller.signal,
                            headers: {
                                Accept: "application/json",
                                "X-Requested-With": "XMLHttpRequest",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Search request failed with status ${response.status}`);
                    }

                    payload = await response.json();
                }

                if (controller.signal.aborted) {
                    return;
                }

                setBackendItems(Array.isArray(payload?.data) ? payload.data : []);
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                setBackendItems([]);
                setBackendError("Live record search is temporarily unavailable.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsBackendLoading(false);
                }
            }
        }, BACKEND_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timer);
            localController?.abort?.();
        };
    }, [isOpen, query]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        ensureHighlightStyles();

        const pendingTarget = readPendingTarget();
        const currentPath = normalizePathOnly(window.location.pathname);
        const currentHash = normalizeHashId(window.location.hash);

        if (pendingTarget) {
            const isExpired = Date.now() - pendingTarget.createdAt > 120000;

            if (isExpired) {
                clearPendingTarget();
            } else if (normalizePathOnly(pendingTarget.path) === currentPath) {
                clearPendingTarget();
                if (pendingTarget.hash) {
                    revealHashTargetWithRetry(pendingTarget.hash, {
                        smooth: true,
                        replaceHistory: true,
                        maxAttempts: SEARCH_REVEAL_MAX_ATTEMPTS,
                    });
                } else if (pendingTarget.searchText) {
                    revealTextTargetWithRetry(pendingTarget.searchText, {
                        smooth: true,
                        replaceHistory: false,
                        maxAttempts: SEARCH_REVEAL_MAX_ATTEMPTS,
                    });
                }
                return undefined;
            }
        }

        if (currentHash && currentHash.startsWith("search-target-")) {
            revealHashTargetWithRetry(currentHash, {
                smooth: true,
                replaceHistory: true,
                maxAttempts: SEARCH_REVEAL_MAX_ATTEMPTS,
            });
        }

        return undefined;
    }, [revealHashTargetWithRetry, revealTextTargetWithRetry]);

    useEffect(() => {
        return () => {
            if (revealAttemptTimeoutRef.current) {
                window.clearTimeout(revealAttemptTimeoutRef.current);
                revealAttemptTimeoutRef.current = null;
            }

            clearCurrentHighlight();
        };
    }, [clearCurrentHighlight]);

    const handleSelect = (item) => {
        if (!item?.path) {
            return;
        }

        const typedQuery = String(query || "").trim();
        const highlightSearchText = typedQuery || String(item.searchText || item.title || "").trim();
        const [targetPath, targetHash] = splitPathAndHash(item.path);
        const currentPath = typeof window !== "undefined" ? normalizePathOnly(window.location.pathname) : "";
        const targetPathOnly = normalizePathOnly(targetPath);

        if (targetPathOnly === currentPath && targetHash) {
            revealHashTargetWithRetry(targetHash, {
                smooth: true,
                replaceHistory: true,
                maxAttempts: SEARCH_REVEAL_MAX_ATTEMPTS,
            });
            onClose?.();
            return;
        }

        if (targetPathOnly === currentPath && !targetHash) {
            const didRevealByText = revealTextTarget(highlightSearchText, {
                smooth: true,
                replaceHistory: false,
            });

            if (!didRevealByText) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }

            onClose?.();
            return;
        }

        if (targetHash) {
            savePendingTarget({
                path: targetPathOnly,
                hash: targetHash,
                searchText: highlightSearchText,
            });
        } else {
            savePendingTarget({
                path: targetPathOnly,
                searchText: highlightSearchText,
            });
        }

        onClose?.();
        router.visit(item.path);
    };

    const handleInputKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (visibleItems.length === 0) {
                return;
            }

            setActiveIndex((currentIndex) =>
                currentIndex >= visibleItems.length - 1 ? 0 : currentIndex + 1
            );
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (visibleItems.length === 0) {
                return;
            }

            setActiveIndex((currentIndex) =>
                currentIndex <= 0 ? visibleItems.length - 1 : currentIndex - 1
            );
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();

            if (visibleItems.length === 0) {
                return;
            }

            handleSelect(visibleItems[activeIndex] || visibleItems[0]);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[1px] px-4 py-8 flex items-start justify-center"
            onClick={() => onClose?.()}
        >
            <div
                className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 sm:p-6"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-[20px] sm:text-[22px] font-[700] text-[#111827]">{title}</h2>
                        <p className="text-[13px] text-gray-500 mt-1">Use arrow keys to move, Enter to navigate.</p>
                    </div>
                    <button
                        onClick={() => onClose?.()}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                        aria-label="Close search"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder={placeholder}
                        className="w-full h-[50px] rounded-xl border border-gray-200 focus:border-[#0955AC] focus:ring-2 focus:ring-[#0955AC26] outline-none pl-11 pr-4 text-[15px] text-[#111827]"
                    />
                </div>

                {query.trim().length >= BACKEND_MIN_QUERY_LENGTH ? (
                    <div className="mt-2 min-h-[18px] text-[12px]">
                        {isBackendLoading ? (
                            <p className="text-[#0955AC] font-[500]">Searching records across dashboards...</p>
                        ) : backendError ? (
                            <p className="text-[#B42318] font-[500]">{backendError}</p>
                        ) : null}
                    </div>
                ) : null}

                <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
                    {visibleItems.length > 0 ? (
                        <div className="max-h-[420px] overflow-y-auto">
                            {visibleItems.map((item, index) => (
                                <button
                                    key={item.id || `${item.path}-${index}`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`w-full text-left p-4 border-b border-gray-100 last:border-b-0 transition ${
                                        index === activeIndex
                                            ? "bg-[#0955AC0F]"
                                            : "bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[15px] font-[700] text-[#111827] truncate">{item.title}</p>
                                            {item.description ? (
                                                <p className="text-[13px] text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                            ) : null}
                                        </div>
                                        <ArrowRight size={16} className="text-[#0955AC] mt-0.5 flex-shrink-0" />
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                                        {item.group ? (
                                            <span className="px-2 py-1 rounded-full bg-[#EAF2FD] text-[#0955AC] font-[600]">
                                                {item.group}
                                            </span>
                                        ) : null}
                                        <span className="text-gray-500">
                                            Manual path: <span className="font-[600] text-gray-700">{item.manualPath || item.path}</span>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <p className="text-[14px] font-[600] text-gray-700">No results found</p>
                            <p className="text-[13px] text-gray-500 mt-1">{emptyStateMessage}</p>
                        </div>
                    )}
                </div>

                <div className="mt-3 text-[12px] text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Shortcut: Cmd+K / Ctrl+K</span>
                    <span>Esc to close</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardSearchModal;
