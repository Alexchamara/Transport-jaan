import React from "react";
import ClientHeader from "./ClientHeader";
import ClientCardDashboard from "../../components/client/ClientCardDashboard";

const ClientMainDashboard = () => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <ClientHeader />
            <ClientCardDashboard />
        </div>
    );
};

export default ClientMainDashboard;