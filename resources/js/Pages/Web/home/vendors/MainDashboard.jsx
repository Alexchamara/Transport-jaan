import React from "react";
import Header from "../../layouts/Header";
import CardDashboard from "../../components/vendors/mainDashboard/CardDashboard";


const MainDashboard = () => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <Header />
            <CardDashboard />
        </div>
    );
};

export default MainDashboard;
