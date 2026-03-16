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
    theme = 'dark', // 'dark' for admin, 'light' for vendor
    styleVariant = 'default',
    headerIcon = null,
    headerIconBg = 'bg-[#AEB9E120]',
}) => {
    const isDisabled = processing || (notesRequired && !notes.trim());

    // Theme configuration
    const themeConfig = {
        dark: {
            backdrop: 'bg-black bg-opacity-60',
            modal: 'bg-gradient-to-br from-[#1A2233] to-[#2A344A]',
            title: 'text-white',
            description: 'text-[#AEB9E1]',
            textInput: 'bg-[#0B1739] border-gray-700 text-white focus:ring-[#0E43FB]',
            cancelBtn: 'border-[#343B4F] text-[#AEB9E1] hover:bg-[#343B4F30]',
            cancelBtnDefault: true,
        },
        light: {
            backdrop: 'bg-black bg-opacity-40',
            modal: 'bg-white',
            title: 'text-black',
            description: 'text-gray-600',
            textInput: 'bg-gray-50 border-gray-300 text-black focus:ring-blue-500',
            cancelBtn: 'border-gray-300 text-gray-700 hover:bg-gray-100',
            cancelBtnDefault: false,
        },
    };

    const config = themeConfig[theme] || themeConfig.dark;
    const confirmBtnClass = confirmClassName || (theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700');

    const isSuperadminConfirm = styleVariant === 'superadmin-confirm';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 ${config.backdrop} backdrop-blur-sm z-50 flex items-center justify-center`}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={isSuperadminConfirm
                    ? 'bg-[#0B1739] border border-[#343B4F] p-6 rounded-[12px] w-[380px] max-w-[90vw] shadow-2xl'
                    : `${config.modal} p-6 rounded-2xl w-[500px] max-w-[90vw] shadow-2xl`
                }
                onClick={(e) => e.stopPropagation()}
            >
                {isSuperadminConfirm ? (
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${headerIconBg}`}>
                            {headerIcon}
                        </div>
                        <h3 className="text-white text-[16px] font-[600]">{title}</h3>
                    </div>
                ) : (
                    <h3 className={`text-[18px] font-[600] mb-2 ${config.title}`}>{title}</h3>
                )}

                <p className={`${isSuperadminConfirm ? 'text-[#AEB9E1] mb-6 leading-relaxed' : `${config.description} mb-4`} text-[13px]`}>
                    {description}
                </p>

                {showNotes && (
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full border rounded-md px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 ${config.textInput} ${isSuperadminConfirm ? 'mb-6' : 'mb-4'}`}
                    />
                )}

                <div className={`flex gap-3 ${isSuperadminConfirm ? '' : 'justify-end'}`}>
                    <button
                        onClick={onClose}
                        className={isSuperadminConfirm
                            ? 'flex-1 border border-[#343B4F] bg-[#0F1A3A] text-[#AEB9E1] text-[13px] py-2.5 rounded-[7px] hover:text-white transition-colors'
                            : `border text-[13px] px-4 py-2 rounded-[5px] transition-colors ${config.cancelBtn}`
                        }
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDisabled}
                        className={isSuperadminConfirm
                            ? `flex-1 text-[13px] py-2.5 rounded-[7px] font-[500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnClass}`
                            : `text-white text-[13px] px-4 py-2 rounded-[5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnClass}`
                        }
                    >
                        {processing ? processingText : confirmText}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ActionModalTemplate;