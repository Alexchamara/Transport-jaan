import React from "react";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";
import CarBookingTable from "./CarBookingTable";

import {
    Plane,
    Ticket,
    TicketCheck,
    DollarSign,
    Search as SearchIcon,
    Settings as SettingsIcon,
    Bell as BellIcon,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    ChevronDown,
    Filter as FilterIcon,
    ArrowUp,
    ArrowDown
} from "lucide-react";


const getTransportIcon = (name, size = 18) => {
    return <Plane size={size} />;
};

const transportTypes = [
    { name: "Economy", percent: 45 },
    { name: "Business", percent: 35 },
    { name: "First Class", percent: 20 },
    { name: "Economy", percent: 55 },
    { name: "Business", percent: 65 },
    { name: "First Class", percent: 40 },
];

const DashContent = () => {
    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex xl:flex-row flex-col gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Flight Booking Dashboard</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <SearchIcon />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <SettingsIcon />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <BellIcon />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Plane />
                    </div>

                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}

            <div className="flex flex-col gap-5 py-10">
                <div className="flex flex-col xl:flex-row gap-5">
                    {/* mini left section */}
                    <div className="flex flex-col gap-5 w-full">
                        {/* mini 4 cards */}
                        <div className="flex flex-col gap-5">
                            <div className="flex xl:flex-row flex-col gap-5 justify-between w-full">
                                {/* card 1 */}
                                <div
                                    className="min-w-[360px] w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <DollarSign />
                                        </div>
                                        <div>
                                            <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[26px] font-[700]">
                                                $8,450
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp className="size-[19px]" />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 1 */}

                                {/* card 2 */}
                                <div
                                    className="min-w-[360px] w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <Plane />
                                        </div>
                                        <div>
                                            <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                                New Flight Bookings
                                            </h1>
                                            <h1 className="text-[26px] font-[700]">
                                                350
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp className="size-[19px]" />
                                            <h1 className="">+1.73%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 2 */}
                            </div>
                            <div className="flex xl:flex-row flex-col gap-5 w-full">
                                {/* card 3 */}
                                <div
                                    className="min-w-[360px] w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <TicketCheck />
                                        </div>
                                        <div>
                                            <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                                Active Flights
                                            </h1>
                                            <h1 className="text-[26px] font-[700]">
                                                24 Flights
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowDown className="size-[19px]" />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 3 */}
                                {/* card 4 */}
                                <div
                                    className="min-w-[360px] min-h-[91px] w-full bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <Plane />
                                        </div>
                                        <div>
                                            <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                                Total Flights
                                            </h1>
                                            <h1 className="text-[26px] font-[700]">
                                                89
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp className="size-[19px]" />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 4 */}
                            </div>
                        </div>
                        {/* end of 4 mini cards */}

                        {/* booking chart */}
                        <div
                            className="min-w-[742px] h-auto bg-[#FFFFFF] flex flex-col justify-center items-center rounded-[10px] py-10 px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            {/* Booking Overview header and dropdown */}
                            <div className="flex flex-row items-center justify-between mb-16 w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Flight Booking Overview
                                </h1>
                                <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        This Year
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                            {/* Booking Overview Bar Chart */}
                            <BookingOverviewBarChart />
                        </div>

                        <div
                            className="min-w-[742px] min-h-[381px] bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between mb-12 w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Earnings Summary
                                </h1>
                                <div className="w-[132px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        Last 8 months
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                            <EarningSummaryChart />
                        </div>
                    </div>
                    {/* mini right section */}
                    <div className="flex flex-col items-center gap-5 w-full">
                        <div
                            className="min-w-[349px] w-full min-h-[206px] bg-[#D8E4F2] flex flex-col px-10 py-5 justify-center items-center rounded-[10px]"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <h1 className="text-[24px] font-[700] mb-3">
                                Seat Availability
                            </h1>

                            <div className="flex flex-col gap-3">
                                <div className="w-[283px] h-[35px] flex flex-row justify-center items-center gap-2 rounded-[6px] px-3 py-2 bg-[#FFFFFF] placeholder:text-[#7B7B7ACC] placeholder:text-[14px] placeholder:font-[500]">
                                    <Plane size={20} />
                                    <input
                                        type="text"
                                        className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                        placeholder="Flight"
                                    />
                                    <ChevronDown />
                                </div>

                                <div className="flex flex-row gap-3">
                                    <div className="w-[137px] h-[35px] bg-[#FFFFFF] rounded-[6px] flex flex-row justify-center items-center gap-2 py-2 px-3">
                                        <CalendarIcon size={20} />
                                        <input
                                            type="text"
                                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                            placeholder="Date"
                                        />
                                    </div>
                                    <div className="w-[137px] h-[35px] bg-[#FFFFFF] rounded-[6px]">
                                        <div className="w-[137px] h-[35px] bg-[#FFFFFF] rounded-[6px] flex flex-row justify-center gap-2 items-center py-2 px-3">
                                            <ClockIcon size={16} />
                                            <input
                                                type="text"
                                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                                placeholder="Time"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button className="w-[283px] h-[40px] bg-[#0955AC] rounded-[6px] flex justify-center items-center text-[16px] font-[700] text-[#FFFFFF] cursor-pointer">
                                    Check Availability
                                </button>
                            </div>
                        </div>
                        <div
                            className="min-w-[349px] w-full min-h-[427px] bg-[#FFFFFF] rounded-[10px] py-5 px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Flight Status
                                </h1>
                                <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        This Week
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                            <RealStatusPieChart />
                        </div>

                        {/* Reminder section  */}
                        <div
                            className="min-w-[349px] w-full min-h-[335px] bg-[#FFFFFF] rounded-[10px] py-5 px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Reminders
                                </h1>
                                <div className="w-[39px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex justify-center items-center gap-3 text-[#00000080] font-[600] text-[30px]">
                                    +
                                </div>
                            </div>
                            <div className="py-10 flex flex-col justify-center items-center gap-2">
                                <div className="w-[286px] h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] w-[199px]">
                                        Confirm airline allotments for next week.
                                    </h1>
                                </div>
                                <div className="w-[286px] h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] w-[199px]">
                                        Update fare rules for partner airlines.
                                    </h1>
                                </div>
                                <div className="w-[286px] h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] w-[199px]">
                                        Reconcile August flight invoices.
                                    </h1>
                                </div>
                            </div>
                        </div>
                        {/* end */}
                    </div>
                </div>

                {/* car booking section */}

                <div
                    className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <div className="flex flex-row justify-between">
                        <h1 className="text-[24px] font-[700]">Flight Bookings</h1>
                        <div className="flex flex-row gap-5">
                            <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                                <SearchIcon className="size-[16px]" />
                                <input
                                    type="text"
                                    className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                    placeholder="Search passenger, flight no., route..."
                                />
                            </div>
                            <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                                <FilterIcon className="size-[12px]" />
                                <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                    Filter
                                </h1>
                                <ChevronDown />
                            </div>
                        </div>
                    </div>

                    <CarBookingTable />
                </div>
                {/* end */}

                <div className="flex flex-col xl:flex-row gap-5 justify-between">
                    <div
                        className="min-w-[500px] w-full min-h-[858px] bg-[#FFFFFF] rounded-[10px] px-10 py-10"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[24px] font-[700]">
                                Cabin classes
                            </h1>
                            <h1 className="text-[24px] font-[700]">...</h1>
                        </div>

                        <div className="mt-10 flex flex-col gap-5">
                            {transportTypes.map((type, idx) => (
                                <div
                                    key={idx}
                                    className="w-full h-[107px] border-[1px] border-[#00000080] rounded-[9px] flex flex-row"
                                >
                                    <div className="h-[107px] w-[172px] flex items-center justify-center">
                                        {getTransportIcon(type.name, 36)}
                                    </div>
                                    <div className="flex flex-col justify-center gap-3 w-full px-5">
                                        <div className="flex flex-row justify-between items-center text-[15px] font-[500]">
                                            <h1 className="text-[#00000080] flex items-center gap-2">
                                                
                                                {type.name}
                                            </h1>
                                            <h1 className="pr-5">
                                                {type.percent}%
                                            </h1>
                                        </div>
                                        <div className="w-full h-[20px] rounded-[4px] bg-[#D8E4F2] relative overflow-hidden">
                                            <div
                                                className="h-full rounded-[4px] absolute top-0 left-0"
                                                style={{
                                                    width: `${type.percent}%`,
                                                    backgroundColor:
                                                        type.percent <= 20
                                                            ? "#F51D1D"
                                                            : "#0955AC",
                                                    transition: "width 0.5s",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        className="min-w-[553px] min-h-[858px] bg-[#0F0F0F08] rounded-[10px] px-10 py-10"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[24px] font-[700]">
                                Recent Activities
                            </h1>
                            <h1 className="text-[24px] font-[700]">...</h1>
                        </div>
                        <h1 className="text-[20px] font-[600] text-[#0F0F0F80] py-3">
                            Today
                        </h1>

                        <div className="flex flex-row justify-center items-start gap-10">
                            <div className="flex flex-col items-center py-5">
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <CalendarIcon />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                            </div>
                            <div className="flex flex-col py-5 gap-10 text-[20px] font-[700]">
                                <div>
                                    <h1>
                                        Alice Johnson completed a flight booking (UL 215, CMB → DXB)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        10:45 AM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Bob Smith's flight booking (UL 123, CMB → SIN) is pending payment
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-[20px] font-[600] text-[#0F0F0F80] py-3">
                            Yesterday
                        </h1>
                        <div className="flex flex-row justify-center items-start gap-10">
                            <div className="flex flex-col items-center py-5">
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                            </div>
                            <div className="flex flex-col py-5 gap-10 text-[20px] font-[700]">
                                <div>
                                    <h1>
                                        Priya Perera completed a flight booking (UL 404, CMB → BKK)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        10:45 AM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Ahmed Khan rescheduled a flight (QR 669, CMB → DOH)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Chen Li confirmed a flight booking (SQ 469, CMB → SIN)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashContent;
