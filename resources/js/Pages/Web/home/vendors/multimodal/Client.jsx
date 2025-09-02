import React from "react";
import SideMenu from "../../../components/vendors/multimodal/SideMenu";
import ClientContent from "../../../components/vendors/multimodal/clients/ClientContent";

const Client = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <ClientContent />
            </div>
        </div>
    );
};

export default Client;
