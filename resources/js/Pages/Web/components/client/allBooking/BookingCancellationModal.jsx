import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Loader } from "lucide-react";
import axios from "axios";

const BookingCancellationModal = ({ booking, isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState("policy"); // policy, confirm, processing, success, error
    const [cancellationReason, setCancellationReason] = useState("");
    const [policyData, setPolicyData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch cancellation policy when modal opens
    React.useEffect(() => {
        if (isOpen && booking?.id) {
            fetchCancellationPolicy();
        }
    }, [isOpen, booking?.id]);

    const fetchCancellationPolicy = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`/client/bookings/${booking.id}/cancellation-policy`);
            if (response.data.success) {
                setPolicyData(response.data);
                setStep("policy");
            } else {
                setError(response.data.message || "Unable to fetch cancellation policy");
                setStep("error");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching cancellation policy");
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            setLoading(true);
            setError("");
            setStep("processing");

            const response = await axios.post(`/client/bookings/${booking.id}/cancel-booking`, {
                reason: cancellationReason || null,
            });

            if (response.data.success) {
                setPolicyData(response.data);
                setStep("success");
                setTimeout(() => {
                    onSuccess && onSuccess(response.data);
                    onClose();
                }, 2000);
            } else {
                setError(response.data.message || "Cancellation failed");
                setStep("error");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error cancelling booking");
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep("policy");
        setCancellationReason("");
        setPolicyData(null);
        setError("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {step === "policy" && "Cancellation Policy"}
                                    {step === "confirm" && "Confirm Cancellation"}
                                    {step === "processing" && "Processing..."}
                                    {step === "success" && "Cancellation Successful"}
                                    {step === "error" && "Cancellation Error"}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6">
                                {/* Policy Step */}
                                {step === "policy" && (
                                    <div className="space-y-4">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <Loader className="h-8 w-8 text-[#0955AC] animate-spin mb-2" />
                                                <p className="text-slate-600">Loading cancellation policy...</p>
                                            </div>
                                        ) : policyData ? (
                                            <>
                                                {/* Refund Details */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-blue-900">
                                                                {policyData.refund_details?.policy_message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Refund Amount */}
                                                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-600">Booking Amount:</span>
                                                        <span className="font-semibold text-slate-900">
                                                            ${booking.total_amount?.toFixed(2) || booking.amount?.toFixed(2) || "0.00"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-600">Refund Percentage:</span>
                                                        <span className="font-semibold text-green-600">
                                                            {policyData.refund_details?.refund_percentage}%
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                                        <span className="font-semibold text-slate-900">You Will Receive:</span>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            ${policyData.refund_details?.refund_amount?.toFixed(2) || "0.00"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Days Until Pickup */}
                                                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                    <p className="text-sm text-amber-900">
                                                        <strong>{policyData.refund_details?.days_until_pickup?.toFixed(1)}</strong> days until pickup
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-slate-600">Unable to load policy</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Confirmation Step */}
                                {step === "confirm" && (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <p className="text-sm text-amber-900">
                                                <strong>Note:</strong> This action cannot be undone. Once cancelled, the booking cannot be restored.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Cancellation Reason (Optional)
                                            </label>
                                            <textarea
                                                value={cancellationReason}
                                                onChange={(e) => setCancellationReason(e.target.value)}
                                                placeholder="Tell us why you're cancelling (max 500 characters)"
                                                maxLength={500}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent resize-none text-sm"
                                                rows={4}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {cancellationReason.length}/500
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Processing Step */}
                                {step === "processing" && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader className="h-12 w-12 text-[#0955AC] animate-spin mb-4" />
                                        <p className="text-slate-600 font-medium">Processing your cancellation...</p>
                                    </div>
                                )}

                                {/* Success Step */}
                                {step === "success" && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                                        <p className="text-slate-900 font-semibold text-center mb-2">
                                            Booking Cancelled Successfully
                                        </p>
                                        <p className="text-slate-600 text-center text-sm mb-4">
                                            Refund of <strong className="text-green-600">
                                                ${policyData?.refund_details?.refund_amount?.toFixed(2) || "0.00"}
                                            </strong> will be processed to your original payment method.
                                        </p>
                                        <p className="text-xs text-slate-500 text-center">
                                            Redirecting in a moment...
                                        </p>
                                    </div>
                                )}

                                {/* Error Step */}
                                {step === "error" && (
                                    <div className="space-y-4">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-900">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                                {step === "policy" && (
                                    <>
                                        <button
                                            onClick={handleClose}
                                            className="flex-1 h-10 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors"
                                        >
                                            Keep Booking
                                        </button>
                                        <button
                                            onClick={() => setStep("confirm")}
                                            className="flex-1 h-10 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Cancel Booking
                                        </button>
                                    </>
                                )}

                                {step === "confirm" && (
                                    <>
                                        <button
                                            onClick={() => setStep("policy")}
                                            disabled={loading}
                                            className="flex-1 h-10 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors disabled:opacity-50"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCancelBooking}
                                            disabled={loading}
                                            className="flex-1 h-10 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading && <Loader className="h-4 w-4 animate-spin" />}
                                            Confirm Cancellation
                                        </button>
                                    </>
                                )}

                                {step === "error" && (
                                    <>
                                        <button
                                            onClick={handleClose}
                                            className="flex-1 h-10 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                setError("");
                                                setStep("policy");
                                                fetchCancellationPolicy();
                                            }}
                                            className="flex-1 h-10 px-4 rounded-lg bg-[#0955AC] text-white font-medium hover:bg-[#0744a0] transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BookingCancellationModal;
