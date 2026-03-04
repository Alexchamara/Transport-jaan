import React from "react";
import { motion } from 'framer-motion';

const ActionModalTemplate = ({
    title,
    description,
    notes,
    setNotes,
    placeholder,
    showNotes,
    notesRequired,
    processing,
    processingText = 'Processing...',
    confirmText,
    confirmClassName,
    onClose,
    onConfirm,
}) => {
    const isDisabled = processing || (notesRequired && !notes.trim());

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-6 rounded-2xl text-white w-[500px] max-w-[90vw] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-[18px] font-[600] mb-2">{title}</h3>
                <p className="text-[#AEB9E1] text-[13px] mb-4">{description}</p>

                {showNotes && (
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#0E43FB] mb-4"
                    />
                )}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="border border-[#343B4F] text-[#AEB9E1] text-[13px] px-4 py-2 rounded-[5px] hover:bg-[#343B4F30] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDisabled}
                        className={`text-white text-[13px] px-4 py-2 rounded-[5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmClassName}`}
                    >
                        {processing ? processingText : confirmText}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ActionModalTemplate;