import React from "react";

const QuoteModal = ({ open, onClose, children }) => {
  // Lock background scroll while the modal is open
  React.useEffect(() => {
    if (!open) return;
    const { style } = document.documentElement; // or document.body
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  // Only close when clicking the backdrop itself
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      {/* Constrain box to viewport; make inside scrollable */}
      <div className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto bg-white rounded-[10px] shadow-lg">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="p-6 sm:p-10">{children}</div>
      </div>
    </div>
  );
};

export default QuoteModal;
