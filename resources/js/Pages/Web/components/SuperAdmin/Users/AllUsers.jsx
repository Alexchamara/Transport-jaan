import React from "react";
import User from "../../../assets/superAdmin/Users Icon.png";
import Change from "../../../assets/superAdmin/Change Icon.svg";
import Phone from "../../../assets/superAdmin/Phone Icon.svg";
import Location from "../../../assets/superAdmin/Map Pin Icon.svg";
import Company from "../../../assets/superAdmin/Bag Simple Icon.svg";
import Status from "../../../assets/superAdmin/Check Icon.svg";
import AvatarM from "../../../assets/superAdmin/Avatar CircleM.svg";
import Avatars from "../../../assets/superAdmin/Avatars.svg";
import Google from "../../../assets/superAdmin/Google.svg";
import Youtube from "../../../assets/superAdmin/Youtube.svg";
import Facebook from "../../../assets/superAdmin/Facebook.svg";
import Pinterest from "../../../assets/superAdmin/Pinterest.svg";
import Twitter from "../../../assets/superAdmin/Twitter.svg";
import Twitch from "../../../assets/superAdmin/Twitch.svg";
import Spotify from "../../../assets/superAdmin/Spotify.svg";
import Reddit from "../../../assets/superAdmin/Reddit.svg";
import LinkedIn from "../../../assets/superAdmin/Linked In.svg";
import Edit from "../../../assets/superAdmin/Pencil Icon.svg";
import Bin from "../../../assets/superAdmin/Bin Icon.svg";

const AllUsers = () => {
    const mockData = [
        {
            name: "Jhone Carter",
            email: "john@google.com",
            phone: "(414) 907 - 1274",
            location: "United States",
            company: "Google",
            companyLogo: Google,
            status: "Online",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
        },
        {
            name: "Sophie Moore",
            email: "sophie@webflow.com",
            phone: "(240) 480 - 4277",
            location: "United Kingdom",
            company: "YouTube",
            companyLogo: Youtube,
            status: "Offline",
            statusColor: "#AEB9E1",
            statusBg: "#F1F1F333",
        },
        {
            name: "Matt Cannon",
            email: "info@mattcannon.com",
            phone: "(318) 698 - 9889",
            location: "Australia",
            company: "Facebook",
            companyLogo: Facebook,
            status: "Offline",
            statusColor: "#AEB9E1",
            statusBg: "#F1F1F333",
        },
        {
            name: "Emma Wilson",
            email: "emma@example.com",
            phone: "(555) 123 - 4567",
            location: "Canada",
            company: "Pinterest",
            companyLogo: Pinterest,
            status: "Online",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
        },
        {
            name: "Liam Smith",
            email: "liam@team.com",
            phone: "(777) 987 - 6543",
            location: "Germany",
            company: "Twitter",
            companyLogo: Twitter,
            status: "Online",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
        },
        {
            name: "Olivia Brown",
            email: "olivia@facebook.com",
            phone: "(222) 333 - 4444",
            location: "France",
            company: "Reddit",
            companyLogo: Reddit,
            status: "Offline",
            statusColor: "#AEB9E1",
            statusBg: "#F1F1F333",
        },
        {
            name: "Noah Davis",
            email: "noah@google.com",
            phone: "(888) 555 - 1234",
            location: "Italy",
            company: "Twitch",
            companyLogo: Twitch,
            status: "Online",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
        },
        {
            name: "Ava Taylor",
            email: "ava@webflow.com",
            phone: "(999) 111 - 2222",
            location: "Spain",
            company: "Spotify",
            companyLogo: Spotify,
            status: "Offline",
            statusColor: "#AEB9E1",
            statusBg: "#F1F1F333",
        },
        {
            name: "Ethan Wilson",
            email: "ethan@facebook.com",
            phone: "(444) 666 - 7777",
            location: "Japan",
            company: "LinkedIn",
            companyLogo: LinkedIn,
            status: "Online",
            statusColor: "#14CA74",
            statusBg: "#05C16833",
        },
        {
            name: "Isabella Lee",
            email: "isabella@google.com",
            phone: "(333) 444 - 5555",
            location: "Brazil",
            company: "YouTube",
            companyLogo: Youtube,
            status: "Offline",
            statusColor: "#AEB9E1",
            statusBg: "#F1F1F333",
        },
    ];

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>All Users</h1>
                <h1 className="text-[#0955AC] text-[14px] font-400">
                    1 - 10 <span className="text-[#AEB9E1]">of 256</span>
                </h1>
            </div>
            <div className="w-full">
                <div className="h-[1px] w-full bg-[#343B4F] mt-2"></div>
            </div>

            {/* Header */}
            <div className="flex flex-row justify-center items-center w-full h-[61px]">
                <div className="flex flex-row justify-start items-start w-full px-[35px]">
                    {/* Name */}
                    <div className="flex flex-row justify-start items-center gap-4 w-[220px]">
                        <input
                            type="checkbox"
                            className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                            style={{
                                boxShadow: "none",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                            }}
                        />
                        <div className="flex flex-row justify-center items-center gap-1">
                            <img src={User} className="size-[10px]" />
                            <h1 className="text-white text-[10px] font-400">
                                Name
                            </h1>
                            <img src={Change} />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-row justify-start items-start gap-4 w-[150px]">
                        <div className="flex flex-row justify-start items-start gap-1">
                            <img src={Phone} className="size-[10px]" />
                            <h1 className="text-white text-[10px] font-400">
                                Phone
                            </h1>
                            <img src={Change} />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex flex-row justify-start items-center gap-4 w-[200px]">
                        <div className="flex flex-row justify-start items-center gap-1">
                            <img src={Location} className="size-[10px]" />
                            <h1 className="text-white text-[10px] font-400">
                                Location
                            </h1>
                            <img src={Change} />
                        </div>
                    </div>

                    {/* Company */}
                    <div className="flex flex-row justify-start items-center gap-4 w-[200px]">
                        <div className="flex flex-row justify-start items-center gap-1">
                            <img src={Company} className="size-[10px]" />
                            <h1 className="text-white text-[10px] font-400">
                                Company
                            </h1>
                            <img src={Change} />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-row justify-start items-center gap-4 w-[150px]">
                        <div className="flex flex-row justify-start items-center gap-1">
                            <img src={Status} className="size-[10px]" />
                            <h1 className="text-white text-[10px] font-400">
                                Status
                            </h1>
                            <img src={Change} />
                        </div>
                    </div>

                    {/* Delete */}
                    <div className="flex flex-row justify-start items-center gap-4 w-[60px]"></div>
                </div>
            </div>

            {/* Rows */}
            {mockData.map((user, index) => (
                <div
                    key={index}
                    className="flex flex-row justify-center items-center w-full h-[61px]"
                >
                    <div className="flex flex-row justify-start items-center w-full px-[35px]">
                        {/* 1st Col */}
                        <div className="flex flex-row justify-start items-center gap-4 w-[220px]">
                            <input
                                type="checkbox"
                                className="size-[12px] cursor-pointer focus:outline-none focus:ring-0 focus:ring-transparent"
                                style={{
                                    boxShadow: "none",
                                    WebkitAppearance: "none",
                                    MozAppearance: "none",
                                }}
                            />
                            <div className="flex flex-row justify-start items-center gap-1">
                                <img
                                    src={index % 2 === 0 ? AvatarM : Avatars}
                                    className="size-[28px]"
                                />
                                <div className="flex flex-col">
                                    <h1 className="text-white text-[10px] font-400">
                                        {user.name}
                                    </h1>
                                    <h2 className="text-[#AEB9E1] text-[10px] font-500">
                                        {user.email}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* 2nd Col */}
                        <div>
                            <h1 className="text-[#AEB9E1] text-[10px] font-500 flex flex-row justify-start items-center w-[150px]">
                                {user.phone}
                            </h1>
                        </div>

                        {/* 3rd Col */}
                        <div>
                            <h1 className="text-[#AEB9E1] text-[10px] font-500 flex flex-row justify-start items-center w-[200px]">
                                {user.location}
                            </h1>
                        </div>

                        {/* 4th Col */}
                        <div className="flex flex-row justify-start items-center w-[200px]">
                            <img
                                src={user.companyLogo}
                                className="size-[30px]"
                            />
                            <h1 className="text-[#AEB9E1] text-[10px] font-500 flex flex-row items-center">
                                {user.company}
                            </h1>
                        </div>

                        {/* 5th Col */}
                        <div className="w-[150px]">
                            <div
                                className="flex flex-row justify-center items-center gap-1 border border-[${user.statusBg}] bg-[${user.statusBg}] px-[6px] py-[2px] rounded-[5px] w-[70px]"
                                style={{
                                    borderColor: user.statusBg,
                                    backgroundColor: user.statusBg,
                                }}
                            >
                                <div
                                    className="w-1 h-1 rounded-full"
                                    style={{
                                        backgroundColor: user.statusColor,
                                    }}
                                />
                                <h1
                                    className="text-[${user.statusColor}] text-[10px] font-500 flex flex-row justify-center items-center"
                                    style={{ color: user.statusColor }}
                                >
                                    {user.status}
                                </h1>
                            </div>
                        </div>

                        {/* 6th Col */}
                        <div className="flex flex-row gap-2 w-[60px]">
                            <img src={Edit} className="size-[12px] cursor-pointer" />
                            <img src={Bin} className="size-[12px] cursor-pointer" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllUsers;
