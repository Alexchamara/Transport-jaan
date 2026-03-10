export const logVendorButtonClick = (buttonName, options = {}) => {
    try {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        if (!csrfToken || !buttonName) {
            return;
        }

        const payload = {
            button_name: buttonName,
            screen: options.screen || 'vendor_dashboard',
            step: options.step || null,
            service_name: options.serviceName || null,
            target_type: options.targetType || 'ui_button',
            target_id: options.targetId || null,
            description: options.description || null,
            metadata: options.metadata || {},
        };

        fetch('/vendor/profile/activity-click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
            keepalive: true,
            credentials: 'same-origin',
        }).catch(() => {
            // Silent fail - activity logs should not block user actions.
        });
    } catch {
        // Silent fail - activity logs should not block user actions.
    }
};

const normalizeButtonText = (value) => {
    if (!value) return "";
    return String(value).replace(/\s+/g, " ").trim().slice(0, 120);
};

const resolveButtonName = (element) => {
    if (!element) return "unknown_button";

    const explicitName = element.getAttribute('data-activity-name');
    if (explicitName) return normalizeButtonText(explicitName);

    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return normalizeButtonText(ariaLabel);

    const title = element.getAttribute('title');
    if (title) return normalizeButtonText(title);

    const text = normalizeButtonText(element.textContent);
    if (text) return text;

    return `${element.tagName?.toLowerCase() || 'element'}_click`;
};

export const installGlobalVendorButtonTracking = (options = {}) => {
    if (typeof document === 'undefined') {
        return () => {};
    }

    const clickSelector = 'button, [role="button"], a[href], input[type="button"], input[type="submit"]';
    const defaultScreen = options.screen || 'vendor_dashboard';

    const clickHandler = (event) => {
        const eventTarget = event.target;
        if (!(eventTarget instanceof Element)) return;

        const clickableElement = eventTarget.closest(clickSelector);
        if (!clickableElement) return;
        if (clickableElement.hasAttribute('data-vendor-log-ignore')) return;

        const now = Date.now();
        const lastLoggedAt = Number(clickableElement.getAttribute('data-vendor-last-log-ts') || 0);
        if (now - lastLoggedAt < 700) return;
        clickableElement.setAttribute('data-vendor-last-log-ts', String(now));

        const buttonName = resolveButtonName(clickableElement);
        logVendorButtonClick(buttonName, {
            screen: defaultScreen,
            description: `Vendor clicked '${buttonName}'.`,
            metadata: {
                capture_mode: 'global',
                element_tag: clickableElement.tagName?.toLowerCase() || null,
                href: clickableElement.getAttribute('href') || null,
                element_id: clickableElement.id || null,
                path: window.location.pathname,
                ...(options.metadata || {}),
            },
        });
    };

    document.addEventListener('click', clickHandler, true);
    return () => {
        document.removeEventListener('click', clickHandler, true);
    };
};
