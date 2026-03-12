import React, { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import VehicleDashboardRightSide from "../../components/SuperAdmin/Vehicles/VehicleDashboardRightSide";

const FlashToast = ({ type = "success", message, onClose }) => {
    if (!message) return null;

    const isSuccess = type === "success";

    return (
        <div className="fixed top-4 right-4 z-[12000] animate-fade-in">
            <div
                className={`px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 border ${
                    isSuccess
                        ? "bg-[#05C168] text-white border-[#05C168]"
                        : "bg-[#FF5A65] text-white border-[#FF5A65]"
                }`}
            >
                {isSuccess ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">{message}</span>
                <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const Vehicles = ({ vehicles, categories, filters, stats, dashboardData, auth }) => {
    const { flash } = usePage().props;
    const [toast, setToast] = useState({ type: "success", message: "" });

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: "success", message: flash.success });
        }
        if (flash?.error) {
            setToast({ type: "error", message: flash.error });
        }
    }, [flash]);

    useEffect(() => {
        if (!toast.message) return undefined;

        const timer = setTimeout(() => {
            setToast((current) => ({ ...current, message: "" }));
        }, 3500);

        return () => clearTimeout(timer);
    }, [toast.message]);

    return (
        <>
            <Head title="Vehicle Management" />
            <FlashToast
                type={toast.type}
                message={toast.message}
                onClose={() => setToast((current) => ({ ...current, message: "" }))}
            />
            <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>
                <div className="flex-1 overflow-x-hidden">
                    <VehicleDashboardRightSide
                        vehicles={vehicles}
                        filters={filters}
                        stats={stats}
                        dashboardData={dashboardData}
                    />
                </div>
            </div>
        </>
    );
};

export default Vehicles;
