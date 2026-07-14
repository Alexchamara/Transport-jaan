import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ProfileContent from "../../../components/vendors/courierService/profile/ProfileContent";

const Profile = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <ProfileContent />
        </VendorShellLayout>
    );
};

export default Profile;
