import React, { useState } from "react";
import filter from "../../../assets/driver/filter.png";
import downArrow from "../../../assets/driver/downArrow.png";
import redo from "../../../assets/driver/redo.png";

const AvailableDelivery = () => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Function to get colors based on delivery mode
    const getModeColors = (mode) => {
        switch (mode.toLowerCase()) {
            case "motorbike":
                return {
                    textColor: "#059669",
                    bgColor: "#D1FAE5",
                };
            case "bicycle":
                return {
                    textColor: "#EF3826",
                    bgColor: "#FEE2E2",
                };
            case "skateboard":
                return {
                    textColor: "#FFA756",
                    bgColor: "#FEF3C7",
                };
        }
    };

    const deliveryData = [
        {
            id: "00001",
            client: "Christine Brooks",
            address: "089 Kutch Green Apt. 448",
            price: "N 4500",
            type: "Foodstuff",
            mode: "Motorbike",
        },
        {
            id: "00002",
            client: "Rosie Pearson",
            address: "979 Immanuel Ferry Suite 526",
            price: "N 4500",
            type: "Book",
            mode: "Motorbike",
        },
        {
            id: "00003",
            client: "Darrell Caldwell",
            address: "8587 Frida Ports",
            price: "N 4500",
            type: "Foodstuff",
            mode: "Bicycle",
        },
        {
            id: "00004",
            client: "Gilbert Johnston",
            address: "768 Destiny Lake Suite 600",
            price: "N 4500",
            type: "Foodstuff",
            mode: "Motorbike",
        },
        {
            id: "00005",
            client: "Alan Cain",
            address: "042 Mylene Throughway",
            price: "N 4500",
            type: "Watch",
            mode: "Motorbike",
        },
        {
            id: "00006",
            client: "Alfred Murray",
            address: "543 Weimann Mountain",
            price: "N 4500",
            type: "Foodstuff",
            mode: "Motorbike",
        },
        {
            id: "00007",
            client: "Maggie Sullivan",
            address: "New Scottieberg",
            price: "N 4500",
            type: "Watch",
            mode: "Motorbike",
        },
        {
            id: "00008",
            client: "Darrell Caldwell",
            address: "8587 Frida Ports",
            price: "N 4500",
            type: "Foodstuff",
            mode: "Skateboard",
        },
        {
            id: "00009",
            client: "John Smith",
            address: "123 Main Street",
            price: "N 3500",
            type: "Electronics",
            mode: "Motorbike",
        },
        {
            id: "00010",
            client: "Jane Doe",
            address: "456 Oak Avenue",
            price: "N 5500",
            type: "Clothing",
            mode: "Bicycle",
        },
        {
            id: "00011",
            client: "Mike Johnson",
            address: "789 Pine Road",
            price: "N 4000",
            type: "Foodstuff",
            mode: "Skateboard",
        },
        {
            id: "00012",
            client: "Sarah Wilson",
            address: "321 Elm Street",
            price: "N 6000",
            type: "Book",
            mode: "Motorbike",
        },
    ];

    // Pagination calculations
    const totalItems = deliveryData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = deliveryData.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePrevious = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="bg-[#0955AC24]">
            <div className="flex flex-col justify-center items-center text-[14px] py-20">
                <h1 className="bebas-neue text-[40px]/[130%] font-[400]">
                    Available{" "}
                    <span className="text-[#0955AC]"> Deliveries</span>{" "}
                </h1>
                <p className="text-center text-[14px]/[33px] pb-20 md:pb-0 px-10 md:px-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum <br /> tempus
                    sapien, tristique consectetur purus pellentesque ac
                </p>

                <div className="flex flex-col xl:gap-10 py-10">
                    <div className="gilroy-medium xl:w-[818px] xl:h-[70px] bg-[#F9F9FB] border-[0.6px] border-[#D5D5D5] rounded-[10px] flex flex-row justify-start items-center text-[14px] font-[400]">
                        <div className="border-r-[0.3px] border-[#979797] h-[70px] w-[70px] px-3 flex justify-evenly items-center">
                            <img src={filter} />
                        </div>

                        <div className="border-r-[0.3px] border-[#979797] h-[70px] w-[100px] px-3 flex justify-evenly items-center">
                            <h1>Filter By</h1>
                        </div>

                        <div className="border-r-[0.3px] border-[#979797] h-[70px] w-[120px] px-3 flex justify-evenly items-center ">
                            <h1>Price</h1>
                            <img src={downArrow} />
                        </div>

                        <div className="border-r-[0.3px] border-[#979797] h-[70px] w-[200px] px-3 flex justify-evenly items-center ">
                            <h1>Package Type</h1>
                            <img src={downArrow} />
                        </div>

                        <div className="border-r-[0.3px] border-[#979797] h-[70px] w-[200px] px-3 flex justify-evenly items-center ">
                            <h1>Delivery mode</h1>
                            <img src={downArrow} />
                        </div>

                        <div className="h-[70px] w-[200px] px-3 flex justify-evenly items-center">
                            <img src={redo} />
                            <h1 className="text-[#EA0234]">Reset Filter</h1>
                        </div>
                    </div>
                    <div className="xl:w-[1141px] bg-[#FFFFFF] border-[0.3px] border-[#B9B9B9] rounded-[14px]">
                        <div className="grid grid-cols-6 py-5">
                            {/* Headings */}
                            <div className="gilroy-bold border-b-[0.6px] h-[49px] flex items-center">
                                <h1 className="pl-10">ID</h1>
                            </div>
                            <div className="gilroy-bold border-b-[0.6px] h-[49px] flex items-center">
                                <h1 className="pl-10">CLIENT</h1>
                            </div>
                            <div className="gilroy-bold border-b-[0.6px] h-[49px] flex items-center">
                                <h1 className="pl-10">DELIVERY ADDRESS</h1>
                            </div>
                            <div className="gilroy-bold border-b-[0.6px] h-[49px] flex items-center">
                                <h1 className="pl-10">PRICE</h1>
                            </div>
                            <div className="gilroy-bold border-b-[0.6px] h-[49px] flex items-center">
                                <h1 className="pl-10">TYPE</h1>
                            </div>
                            <div className="gilroy-bold border-b-[0.6px] h-[49px] flex items-center">
                                <h1 className="pl-10">MODE</h1>
                            </div>

                            {/* Data rows using .map() */}
                            {currentData.map((delivery, index) => {
                                const modeColors = getModeColors(delivery.mode);
                                const isLastRow = index === currentData.length - 1;
                                return (
                                    <React.Fragment key={delivery.id}>
                                        <div className={`gilroy-medium ${!isLastRow ? 'border-b-[0.6px]' : ''} h-[85px] flex items-center`}>
                                            <h1 className="pl-10">
                                                {delivery.id}
                                            </h1>
                                        </div>
                                        <div className={`gilroy-medium ${!isLastRow ? 'border-b-[0.6px]' : ''} h-[85px] flex items-center`}>
                                            <h1 className="pl-10">
                                                {delivery.client}
                                            </h1>
                                        </div>
                                        <div className={`gilroy-medium ${!isLastRow ? 'border-b-[0.6px]' : ''} h-[85px] flex items-center`}>
                                            <h1 className="pl-10">
                                                {delivery.address}
                                            </h1>
                                        </div>
                                        <div className={`gilroy-medium ${!isLastRow ? 'border-b-[0.6px]' : ''} h-[85px] flex items-center`}>
                                            <h1 className="pl-10">
                                                {delivery.price}
                                            </h1>
                                        </div>
                                        <div className={`gilroy-medium ${!isLastRow ? 'border-b-[0.6px]' : ''} h-[85px] flex items-center`}>
                                            <h1 className="pl-10">
                                                {delivery.type}
                                            </h1>
                                        </div>
                                        <div className={`gilroy-medium ${!isLastRow ? 'border-b-[0.6px]' : ''} h-[85px] flex items-center`}>
                                            <div
                                                className="w-[93px] h-[27px] rounded-[4.5px] flex justify-center items-center ml-10 text-[12px]"
                                                style={{
                                                    backgroundColor:
                                                        modeColors.bgColor,
                                                    color: modeColors.textColor,
                                                }}
                                            >
                                                <h1>{delivery.mode}</h1>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Pagination Section */}
                    <div className="xl:w-[1141px] flex justify-between items-center py-4 px-6">
                        <div className="text-[14px] text-[#0955AC] gilroy-medium">
                            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                        </div>
                        <div className="gap-2 border-[1px] border-[#D9D9D9] rounded-[6px] w-[166px] h-[26px] flex justify-evenly items-center text-[10px]">
                            <button 
                                className={`text-[10px] gilroy-medium transition-colors ${currentPage === 1 ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-[#0955AC] hover:bg-[#F9FAFB]'}`}
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    className={`size-[26px] text-[10px] flex justify-center items-center cursor-pointer transition-colors ${
                                        currentPage === index + 1 
                                            ? 'bg-[#0955AC] text-white' 
                                            : 'bg-transparent text-[#0955AC] hover:bg-[#F3F4F6]'
                                    }`}
                                    onClick={() => handlePageClick(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button 
                                className={`text-[10px] gilroy-medium transition-colors ${currentPage === totalPages ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-[#0955AC] hover:bg-[#F9FAFB]'}`}
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailableDelivery;
