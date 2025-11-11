import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Added

import ClientTable from "./ClientTable";

import UserDropdown from "../../Userdropdown";

const ClientContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">
                    Ticket Booking Clients
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    {/* <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div> */}

                    <div className="flex flex-row gap-5 relative items-center">
                        <UserDropdown />
                    </div>
                </div>
            </div>
            {/* end of header section */}

            <div
                className="w-auto h-auto bg-[#FFFFFF] rounded-[10px] mt-10 px-10 py-10"
                style={{
                    boxShadow: "4px 4px 4px #0000001A",
                }}
            >
                <ClientTable />
            </div>
        </div>
    );
};

export default ClientContent;
