import React from "react";
import { usePage, Link } from "@inertiajs/react";
import { AlertTriangle, Clock, XCircle, ShieldOff, ArrowRight } from "lucide-react";

/**
 * Displays a status banner based on the vendor's account status.
 * - unverified  → orange  "Account Not Verified" + CTA to complete profile
 * - inreview    → blue    "Account Under Review"
 * - rejected    → red     "Account Rejected" + reason
 * - blocked     → dark    "Account Blocked"
 * - verified    → nothing
 */
const UnverifiedBanner = ({ className = "" }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const status = (user?.status ?? "").toLowerCase();

    if (status === "verified") return null;

    const configs = {
        unverified: {
            wrapper: "bg-amber-50 border-amber-300 text-amber-800",
            icon: <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />,
            title: "Account Not Verified",
            body: (
                <div>
                    <p className="text-amber-700 text-xs mt-0.5">
                        You are viewing <strong>sample data</strong>. Your account is pending verification.
                        Please complete your business profile and register for services to get verified.
                    </p>
                    <Link
                        href="/vendor/profile"
                        className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Complete Your Profile
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            ),
        },
        inreview: {
            wrapper: "bg-blue-50 border-blue-300 text-blue-800",
            icon: <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />,
            title: "Application Under Review",
            body: (
                <p className="text-blue-700 text-xs mt-0.5">
                    Your application is currently under review. You can view <strong>dummy data</strong> for
                    now — once your account is verified, you will have access to real data. This process
                    typically takes <strong>2–3 business days</strong>. We appreciate your patience!
                </p>
            ),
        },
        rejected: {
            wrapper: "bg-red-50 border-red-300 text-red-800",
            icon: <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />,
            title: "Account Rejected",
            body: (
                <div className="text-xs mt-0.5 text-red-700">
                    <p>
                        Your account application has been rejected. You are viewing{" "}
                        <strong>sample data</strong> only.
                    </p>
                    {user?.rejection_reason && (
                        <p className="mt-1">
                            <strong>Reason: </strong>{user.rejection_reason}
                        </p>
                    )}
                    <p className="mt-1">
                        Please contact support if you believe this is a mistake.
                    </p>
                </div>
            ),
        },
        blocked: {
            wrapper: "bg-gray-100 border-gray-400 text-gray-800",
            icon: <ShieldOff className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-600" />,
            title: "Account Blocked",
            body: (
                <p className="text-gray-600 text-xs mt-0.5">
                    Your account has been blocked. You are viewing <strong>sample data</strong> only.
                    Please contact our support team for further assistance.
                </p>
            ),
        },
    };

    const cfg = configs[status] ?? configs["unverified"];

    return (
        <div className={`flex items-start gap-3 px-4 py-3 mb-6 border rounded-[10px] text-sm shadow-sm ${cfg.wrapper} ${className}`}>
            {cfg.icon}
            <div>
                <p className="font-semibold">{cfg.title}</p>
                {cfg.body}
            </div>
        </div>
    );
};

export default UnverifiedBanner;
