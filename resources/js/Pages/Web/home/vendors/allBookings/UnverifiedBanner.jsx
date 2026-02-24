import React from "react";
import { usePage } from "@inertiajs/react";
import { AlertTriangle } from "lucide-react";

/**
 * Shows a warning banner whenever the vendor is NOT verified.
 * Import this component and drop it at the top of any page content area.
 */
const UnverifiedBanner = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.vendor_status === "verified" || user?.is_verified === true;

    if (isVerified) return null;

    return (
        <div className="flex items-start gap-3 px-4 py-3 mb-6 bg-amber-50 border border-amber-300 rounded-[10px] text-amber-800 text-sm shadow-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <div>
                <p className="font-semibold">Account Not Verified</p>
                <p className="text-amber-700 text-xs mt-0.5">
                    You are viewing <strong>sample data</strong>. Your account is pending verification.
                    Please complete the verification process to access real data and unlock all features.
                </p>
            </div>
        </div>
    );
};

export default UnverifiedBanner;
