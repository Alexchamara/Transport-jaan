import React from "react";
import { usePage } from "@inertiajs/react";
import VendorShellLayout from "../../../../Components/vendors/VendorShellLayout";

/**
 * Shared layout for all Vehicle Rental vendor pages.
 * Delegates to VendorShellLayout which combines the sidebar + top service navbar.
 *
 * Usage:
 *   <VendorLayout activeService="Vehicle Rental">
 *     <YourContent />
 *   </VendorLayout>
 */
const VendorLayout = ({ children, activeService = "Vehicle Rental" }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified =
        user?.status === "verified" || user?.status === "Verified";

    return (
        <VendorShellLayout activeService={activeService} isVerified={isVerified}>
            {children}
        </VendorShellLayout>
    );
};

export default VendorLayout;
