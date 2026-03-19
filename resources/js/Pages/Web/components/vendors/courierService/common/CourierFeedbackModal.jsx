import React from "react";
import ActionModalTemplate from "../../../SuperAdmin/Common/ActionModalTemplate";

const TYPE_CONFIG = {
    success: {
        title: "Success",
        confirmText: "OK",
        confirmClassName: "bg-[#16A34A] hover:bg-[#15803D]",
    },
    error: {
        title: "Action Failed",
        confirmText: "Close",
        confirmClassName: "bg-[#DC2626] hover:bg-[#B91C1C]",
    },
    warning: {
        title: "Warning",
        confirmText: "Understood",
        confirmClassName: "bg-[#D97706] hover:bg-[#B45309]",
    },
    info: {
        title: "Notice",
        confirmText: "OK",
        confirmClassName: "bg-[#2563EB] hover:bg-[#1D4ED8]",
    },
};

const CourierFeedbackModal = ({
    open,
    type = "info",
    message,
    title,
    confirmText,
    cancelText = "Cancel",
    processing = false,
    processingText = "Processing...",
    showCancel = false,
    onConfirm,
    onClose,
}) => {
    if (!open || !message) {
        return null;
    }

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
    const requiresPasswordUpdate = typeof message === "string"
        && message.toLowerCase().includes("please update your password before continuing");

    const resolvedConfirmText = requiresPasswordUpdate
        ? "Go to Security"
        : (confirmText || config.confirmText);
    const resolvedTitle = title || config.title;
    const handleConfirm = requiresPasswordUpdate
        ? () => {
            window.location.href = `${route("courierService.profile")}?tab=security`;
        }
        : (onConfirm || onClose);
    const resolvedCancelText = requiresPasswordUpdate ? "Close" : cancelText;
    const shouldShowCancel = showCancel || requiresPasswordUpdate;

    return (
        <ActionModalTemplate
            title={resolvedTitle}
            description={message}
            notes=""
            setNotes={() => {}}
            placeholder=""
            showNotes={false}
            notesRequired={false}
            processing={processing}
            processingText={processingText}
            confirmText={resolvedConfirmText}
            confirmClassName={config.confirmClassName}
            onClose={shouldShowCancel ? onClose : handleConfirm}
            onConfirm={handleConfirm}
            theme="light"
            cancelText={resolvedCancelText}
        />
    );
};

export default CourierFeedbackModal;
