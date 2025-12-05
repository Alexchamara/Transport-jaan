import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import ReservationBarChart from "./ReservationBarChart";
import WarehouseReservationTable from "./WarehouseReservationTable";

import UserDropdown from "../../../vendors/UserDropdown";


const ReservationContent = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch reservations data
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setLoading(true);
                const response = await axios.get("/vendors/warehouse/api/reservations");
                
                if (response.data.success) {
                    setReservations(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">
                    Warehouse Reservations
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
            </div>

            {/* Data Display */}
            <div className="mt-10">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-[16px] text-[#7B7B7A]">
                            Loading reservations...
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-6 shadow">
                        <h2 className="text-[24px] font-[700] mb-4">Raw Data</h2>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-sm">
                            {JSON.stringify(reservations, null, 2)}
                        </pre>
                        <div className="mt-4 text-[14px] text-[#7B7B7A]">
                            Total Records: {reservations.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationContent;
