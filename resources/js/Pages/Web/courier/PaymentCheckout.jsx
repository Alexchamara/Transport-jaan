import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";

const PaymentCheckout = ({ shipment, payment, checkout, pollingUrl, retryUrl, returnToCreateUrl }) => {
    const [liveStatus, setLiveStatus] = useState(payment?.status || "pending");
    const [checkError, setCheckError] = useState("");
    const [isChecking, setIsChecking] = useState(false);

    const canProceed = Boolean(checkout?.isReady) && liveStatus === "pending";

    const statusTone = useMemo(() => {
        if (liveStatus === "paid") {
            return "border-green-200 bg-green-50 text-green-700";
        }

        if (["failed", "cancelled", "expired"].includes(liveStatus)) {
            return "border-red-200 bg-red-50 text-red-700";
        }

        return "border-amber-200 bg-amber-50 text-amber-700";
    }, [liveStatus]);

    const checkStatus = async () => {
        if (!pollingUrl || isChecking) {
            return;
        }

        setCheckError("");
        setIsChecking(true);

        try {
            const response = await fetch(pollingUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error("Status check failed.");
            }

            const data = await response.json();
            setLiveStatus(String(data.paymentStatus || "pending"));
        } catch (error) {
            setCheckError("Unable to refresh payment status right now. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    const retryPayment = () => {
        if (!retryUrl || isChecking) {
            return;
        }

        router.post(retryUrl, {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#0B1739]">
            <Head title="Courier Card Payment" />
            <Header />

            <main className="container mx-auto flex-1 px-4 py-10">
                <div className="mx-auto max-w-3xl rounded-2xl border border-[#E3EAF5] bg-white p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#0955AC]">Courier Payment</p>
                        <h1 className="text-2xl font-semibold">Complete Your Card Payment</h1>
                        <p className="text-sm text-[#5B6887]">
                            Shipment reference <span className="font-semibold">{shipment?.reference}</span> has been created. Continue with PayHere to complete payment.
                        </p>
                    </div>

                    <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${statusTone}`}>
                        <p>
                            <span className="font-semibold">Payment status:</span> {liveStatus}
                        </p>
                        {payment?.failureReason && (
                            <p className="mt-1">
                                <span className="font-semibold">Reason:</span> {payment.failureReason}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 rounded-xl border border-[#E3EAF5] bg-[#F8FAFD] p-4 text-sm md:grid-cols-2">
                        <p>
                            <span className="font-semibold">Amount:</span> {Number(payment?.amount || 0).toFixed(2)} {payment?.currency || "LKR"}
                        </p>
                        <p>
                            <span className="font-semibold">Order ID:</span> {payment?.orderId || "-"}
                        </p>
                        <p>
                            <span className="font-semibold">Provider:</span> {payment?.provider || "PayHere"}
                        </p>
                        <p>
                            <span className="font-semibold">Method:</span> {payment?.method || "card"}
                        </p>
                    </div>

                    {!checkout?.isReady && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {checkout?.reason || "Payment checkout is not ready. Please contact support."}
                        </div>
                    )}

                    {canProceed && (
                        <form method="POST" action={checkout.checkoutUrl} className="mt-6">
                            {Object.entries(checkout.fields || {}).map(([key, value]) => (
                                <input
                                    key={key}
                                    type="hidden"
                                    name={key}
                                    value={value === null || value === undefined ? "" : String(value)}
                                />
                            ))}

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-lg bg-[#0955AC] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0a4b93]"
                            >
                                Proceed to PayHere
                            </button>
                        </form>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={checkStatus}
                            disabled={isChecking}
                            className="inline-flex items-center justify-center rounded-lg border border-[#0955AC] px-4 py-2 text-sm font-semibold text-[#0955AC] transition hover:bg-[#EAF2FD] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isChecking ? "Checking..." : "Refresh payment status"}
                        </button>

                        {liveStatus !== "paid" && retryUrl && (
                            <button
                                type="button"
                                onClick={retryPayment}
                                className="inline-flex items-center justify-center rounded-lg border border-[#D9A404] px-4 py-2 text-sm font-semibold text-[#946200] transition hover:bg-[#FFF6D5]"
                            >
                                Retry payment
                            </button>
                        )}

                        <Link
                            href={returnToCreateUrl || "/couriers/create"}
                            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#F1F5F9]"
                        >
                            Back to courier form
                        </Link>
                    </div>

                    {checkError && <p className="mt-3 text-sm text-red-600">{checkError}</p>}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentCheckout;
