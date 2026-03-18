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
        if (flash.success) {
            setFeedback({ type: "success", message: flash.success });
            return;
        }

        if (flash.error) {
            setFeedback({ type: "error", message: flash.error });
        }
    }, [flash.success, flash.error]);

    useEffect(() => {
        if (!feedback) {
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
