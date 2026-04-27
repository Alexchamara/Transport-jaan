import { useEffect, useState } from "react";

const EMPTY_CONFIRM = {
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    type: "warning",
    onConfirm: null,
};

const useCourierActionModal = (flash = {}, autoDismissMs = 3200) => {
    const [feedback, setFeedback] = useState(null);
    const [confirmState, setConfirmState] = useState(EMPTY_CONFIRM);

    useEffect(() => {
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
        const currentTab = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("tab")
            : "";
        const isOnCourierSecurityTab = (currentPath === "/courierService/profile" && currentTab === "security")
            || currentPath === "/courierService/profile/security";

        if (flash.password_change_required) {
            if (isOnCourierSecurityTab) {
                setFeedback(null);
                return;
            }

            setFeedback({
                type: "error",
                message: flash.error || "Please update your password before continuing.",
                passwordChangeRequired: true,
                passwordChangeTargetUrl: flash.password_change_target || "",
            });
            return;
        }

        if (flash.success) {
            setFeedback({ type: "success", message: flash.success });
            return;
        }

        if (flash.error) {
            if (isOnCourierSecurityTab && flash.error === "Please update your password before continuing.") {
                setFeedback(null);
                return;
            }

            setFeedback({ type: "error", message: flash.error });
        }
    }, [flash.success, flash.error, flash.password_change_required, flash.password_change_target]);

    useEffect(() => {
        if (!feedback) {
            return;
        }

        if (feedback.passwordChangeRequired) {
            return;
        }

        const timer = setTimeout(() => {
            setFeedback(null);
        }, autoDismissMs);

        return () => clearTimeout(timer);
    }, [feedback, autoDismissMs]);

    const closeFeedback = () => setFeedback(null);

    const openConfirm = ({
        title,
        message,
        onConfirm,
        confirmText = "Confirm",
        type = "warning",
    }) => {
        setConfirmState({
            open: true,
            title: title || "Confirm Action",
            message: message || "Are you sure you want to continue?",
            confirmText,
            type,
            onConfirm: onConfirm || null,
        });
    };

    const closeConfirm = () => setConfirmState(EMPTY_CONFIRM);

    const runConfirm = () => {
        if (typeof confirmState.onConfirm === "function") {
            confirmState.onConfirm();
        }
        closeConfirm();
    };

    return {
        feedback,
        closeFeedback,
        setFeedback,
        confirmState,
        openConfirm,
        closeConfirm,
        runConfirm,
    };
};

export default useCourierActionModal;
