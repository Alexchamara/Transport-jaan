import React, { useMemo } from "react";
import { usePage, Head, router } from "@inertiajs/react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import WarehouseImages from "../../components/warehouseDetails/WarehouseImages";
import WarehouseInfo from "../../components/warehouseDetails/WarehouseInfo";

const WarehouseDetails = () => {
    const { props } = usePage();
    const { warehouse, auth } = props;

    const handleBookWarehouse = () => {
        console.log('Booking warehouse:', warehouse);
        
        // Check if user is logged in
        if (!auth?.user) {
            // If not logged in, redirect to sign-in page with redirect URL
            const bookingUrl = `/warehouse-bookings/bookings/${warehouse.type || 'general'}/${warehouse.id}`;
            router.visit('/signin', {
                method: 'get',
                data: {
                    redirect: bookingUrl,
                    warehouse_id: warehouse.id,
                    warehouse_type: warehouse.type || 'general'
                },
                preserveState: false
            });
            return;
        }

        // If logged in, proceed to booking flow
        router.visit(`/warehouse-bookings/bookings/${warehouse.type || 'general'}/${warehouse.id}`, {
            method: 'get',
            data: { 
                warehouse: memoizedWarehouse,
                warehouseDetails: warehouse,
                warehouseImages: warehouse.images || []
            },
            preserveState: false
        });
    };

    const memoizedWarehouse = useMemo(() => {
        if (!warehouse) return null;
        return {
            ...warehouse,
            name: warehouse.name,
            price: warehouse.monthly_rate || warehouse.price,
            monthly_rate: warehouse.monthly_rate,
            final_amount: warehouse.final_amount,
            image: warehouse.image,
        };
    }, [warehouse]);

    if (!memoizedWarehouse) {
        return (
            <div>
                <Head title="Warehouse Not Found - Transport Jaan" />
                <Header />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-xl mb-4 poppins">No warehouse selected</p>
                        <button
                            onClick={() => router.visit('/warehouseList')}
                            className="bg-[#0955AC] text-white px-6 py-3 rounded-lg hover:bg-[#0744A0] transition-colors poppins"
                        >
                            Browse Warehouses
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Head title={`${memoizedWarehouse.name} - Warehouse Details - Transport Jaan`} />
            <Header />
            
            <div className="bg-[#FBFCFF] min-h-screen">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-3">
                        <nav className="text-sm poppins">
                            <span className="text-gray-500">Home</span>
                            <span className="text-gray-400 mx-2">›</span>
                            <span className="text-gray-500">Warehouses</span>
                            <span className="text-gray-400 mx-2">›</span>
                            <span className="text-[#0955AC] font-medium">{memoizedWarehouse.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-6 md:py-10">
                    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
                        <WarehouseImages />
                        <WarehouseInfo />
                        
                        {/* Book Now Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleBookWarehouse}
                                className="bg-[#0955AC] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#0744A0] poppins shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default WarehouseDetails;