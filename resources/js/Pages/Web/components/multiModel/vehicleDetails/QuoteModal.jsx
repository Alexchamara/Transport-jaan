import React from "react";

const QuoteModal = ({ open, onClose, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
            <div
                className="bg-white rounded-[10px] p-10 shadow-lg xl:w-auto xl:h-auto relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-xl font-bold"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                {children}
            </div>


        </div>
    );
};

export default QuoteModal; 