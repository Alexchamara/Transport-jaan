import React from "react";
import recom1 from "../../assets/flight/recom1.svg";
import recom2 from "../../assets/flight/recom2.svg";
import recom3 from "../../assets/flight/recom3.svg";
import heart from "../../assets/flight/heart.svg";
import yellowStar from "../../assets/flight/yellowStar.svg";
import clock from "../../assets/flight/clock.svg";
import person from "../../assets/flight/person.svg";

const Recommended = () => {
    return (
        <div className="flex flex-col justify-center items-center px-10 py-10 bg-[#DCDCDC]">
            <h1 className="bebas-neue text-[52px]/[76px] font-[400]">
                Recommended For You
            </h1>
            <p className="text-[#737373] font-[500] text-[20px]/[32px]">
                The best booking platform you can trust
            </p>

            <div className="flex flex-col gap-10 py-10">
                {/* 1st row */}
                <div className="flex flex-col xl:flex-row gap-10">
                    {/* Card 1 */}
                    <div className="relative">
                        <img
                            src={recom1}
                            className="relative rounded-t-[30px] -mb-[40px] z-0"
                        />
                        <div
                            className="absolute top-5 left-5 w-[111px] h-[32px] bg-[#FFFFFF] rounded-[50px] text-[#F09814] font-[700] flex justify-center items-center z-20 cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            Top Rated
                        </div>
                        <div
                            className="absolute top-5 right-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <img src={heart} />
                        </div>

                        <div
                            className="relative xl:w-[390px] xl:h-[259px] bg-[#FFFFFF] rounded-[30px] z-10 p-10"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div
                                className="absolute -top-5 right-10 w-[169px] h-[36px] bg-[#FFFFFF] rounded-[50px] text-[#000000] flex flex-row justify-center items-center gap-2 text-[14px] font-[700]"
                                style={{
                                    boxShadow:
                                        "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <img src={yellowStar} />
                                <h1>
                                    4.96{" "}
                                    <span className="font-[500] text-[#737373]">
                                        (672 reviews)
                                    </span>
                                </h1>
                            </div>

                            <h1 className="text-[24px]/[32px] font-[800]">
                                California Sunset/Twilight Boat Cruise
                            </h1>

                            <div className="flex flex-row justify-start items-center gap-5 text-[16px] font-[500] text-[#737373] my-3">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={clock} />
                                    <h1>2 days 3 nights</h1>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={person} />
                                    <h1>4-6 guest</h1>
                                </div>
                            </div>

                            <div className="my-10 flex flex-row justify-between">
                                <h1 className="text-[24px] font-[800] ">
                                    $48.25{" "}
                                    <span className="text-[#737373] font-[500]">
                                        {" "}
                                        / person
                                    </span>
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] font-[700] text-[14px] flex justify-center items-center border-[1px] border-[#E4E6E8] cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative">
                        <img
                            src={recom2}
                            className="relative rounded-t-[30px] -mb-[40px] z-0"
                        />
                        <div
                            className="absolute top-5 left-5 w-[111px] h-[32px] bg-[#FFFFFF] rounded-[50px] text-[#3DC262] font-[700] flex justify-center items-center z-20 cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            Best Sale
                        </div>
                        <div
                            className="absolute top-5 right-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <img src={heart} />
                        </div>

                        <div
                            className="relative xl:w-[390px] xl:h-[259px] bg-[#FFFFFF] rounded-[30px] z-10 p-10"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div
                                className="absolute -top-5 right-10 w-[169px] h-[36px] bg-[#FFFFFF] rounded-[50px] text-[#000000] flex flex-row justify-center items-center gap-2 text-[14px] font-[700]"
                                style={{
                                    boxShadow:
                                        "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <img src={yellowStar} />
                                <h1>
                                    4.96{" "}
                                    <span className="font-[500] text-[#737373]">
                                        (672 reviews)
                                    </span>
                                </h1>
                            </div>

                            <h1 className="text-[24px]/[32px] font-[800]">
                                NYC: Food Tastings and Culture Tour
                            </h1>

                            <div className="flex flex-row justify-start items-center gap-5 text-[16px] font-[500] text-[#737373] my-3">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={clock} />
                                    <h1>2 days 3 nights</h1>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={person} />
                                    <h1>4-6 guest</h1>
                                </div>
                            </div>

                            <div className="my-10 flex flex-row justify-between">
                                <h1 className="text-[24px] font-[800] ">
                                    $48.25{" "}
                                    <span className="text-[#737373] font-[500]">
                                        {" "}
                                        / person
                                    </span>
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] font-[700] text-[14px] flex justify-center items-center border-[1px] border-[#E4E6E8] cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="relative">
                        <img
                            src={recom3}
                            className="relative rounded-t-[30px] -mb-[40px] z-0"
                        />
                        <div
                            className="absolute top-5 left-5 w-[111px] h-[32px] bg-[#FFFFFF] rounded-[50px] text-[#F09814] font-[700] flex justify-center items-center z-20 cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            25% Off
                        </div>
                        <div
                            className="absolute top-5 right-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <img src={heart} />
                        </div>

                        <div
                            className="relative xl:w-[390px] xl:h-[259px] bg-[#FFFFFF] rounded-[30px] z-10 p-10"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div
                                className="absolute -top-5 right-10 w-[169px] h-[36px] bg-[#FFFFFF] rounded-[50px] text-[#000000] flex flex-row justify-center items-center gap-2 text-[14px] font-[700]"
                                style={{
                                    boxShadow:
                                        "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <img src={yellowStar} />
                                <h1>
                                    4.96{" "}
                                    <span className="font-[500] text-[#737373]">
                                        (672 reviews)
                                    </span>
                                </h1>
                            </div>

                            <h1 className="text-[24px]/[32px] font-[800]">
                                Grand Canyon Horseshoe Bend 2 days
                            </h1>

                            <div className="flex flex-row justify-start items-center gap-5 text-[16px] font-[500] text-[#737373] my-3">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={clock} />
                                    <h1>2 days 3 nights</h1>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={person} />
                                    <h1>4-6 guest</h1>
                                </div>
                            </div>

                            <div className="my-10 flex flex-row justify-between">
                                <h1 className="text-[24px] font-[800] ">
                                    $48.25{" "}
                                    <span className="text-[#737373] font-[500]">
                                        {" "}
                                        / person
                                    </span>
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] font-[700] text-[14px] flex justify-center items-center border-[1px] border-[#E4E6E8] cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2st row */}
                <div className="flex flex-col xl:flex-row gap-10">
                    {/* Card 1 */}
                    <div className="relative">
                        <img
                            src={recom1}
                            className="relative rounded-t-[30px] -mb-[40px] z-0"
                        />
                        <div
                            className="absolute top-5 left-5 w-[111px] h-[32px] bg-[#FFFFFF] rounded-[50px] text-[#F09814] font-[700] flex justify-center items-center z-20 cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            Top Rated
                        </div>
                        <div
                            className="absolute top-5 right-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <img src={heart} />
                        </div>

                        <div
                            className="relative xl:w-[390px] xl:h-[259px] bg-[#FFFFFF] rounded-[30px] z-10 p-10"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div
                                className="absolute -top-5 right-10 w-[169px] h-[36px] bg-[#FFFFFF] rounded-[50px] text-[#000000] flex flex-row justify-center items-center gap-2 text-[14px] font-[700]"
                                style={{
                                    boxShadow:
                                        "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <img src={yellowStar} />
                                <h1>
                                    4.96{" "}
                                    <span className="font-[500] text-[#737373]">
                                        (672 reviews)
                                    </span>
                                </h1>
                            </div>

                            <h1 className="text-[24px]/[32px] font-[800]">
                                California Sunset/Twilight Boat Cruise
                            </h1>

                            <div className="flex flex-row justify-start items-center gap-5 text-[16px] font-[500] text-[#737373] my-3">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={clock} />
                                    <h1>2 days 3 nights</h1>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={person} />
                                    <h1>4-6 guest</h1>
                                </div>
                            </div>

                            <div className="my-10 flex flex-row justify-between">
                                <h1 className="text-[24px] font-[800] ">
                                    $48.25{" "}
                                    <span className="text-[#737373] font-[500]">
                                        {" "}
                                        / person
                                    </span>
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] font-[700] text-[14px] flex justify-center items-center border-[1px] border-[#E4E6E8] cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative">
                        <img
                            src={recom2}
                            className="relative rounded-t-[30px] -mb-[40px] z-0"
                        />
                        <div
                            className="absolute top-5 left-5 w-[111px] h-[32px] bg-[#FFFFFF] rounded-[50px] text-[#F09814] font-[700] flex justify-center items-center z-20 cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            25% Off
                        </div>
                        <div
                            className="absolute top-5 right-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <img src={heart} />
                        </div>

                        <div
                            className="relative xl:w-[390px] xl:h-[259px] bg-[#FFFFFF] rounded-[30px] z-10 p-10"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div
                                className="absolute -top-5 right-10 w-[169px] h-[36px] bg-[#FFFFFF] rounded-[50px] text-[#000000] flex flex-row justify-center items-center gap-2 text-[14px] font-[700]"
                                style={{
                                    boxShadow:
                                        "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <img src={yellowStar} />
                                <h1>
                                    4.96{" "}
                                    <span className="font-[500] text-[#737373]">
                                        (672 reviews)
                                    </span>
                                </h1>
                            </div>

                            <h1 className="text-[24px]/[32px] font-[800]">
                                NYC: Food Tastings and Culture Tour
                            </h1>

                            <div className="flex flex-row justify-start items-center gap-5 text-[16px] font-[500] text-[#737373] my-3">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={clock} />
                                    <h1>2 days 3 nights</h1>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={person} />
                                    <h1>4-6 guest</h1>
                                </div>
                            </div>

                            <div className="my-10 flex flex-row justify-between">
                                <h1 className="text-[24px] font-[800] ">
                                    $48.25{" "}
                                    <span className="text-[#737373] font-[500]">
                                        {" "}
                                        / person
                                    </span>
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] font-[700] text-[14px] flex justify-center items-center border-[1px] border-[#E4E6E8] cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="relative">
                        <img
                            src={recom3}
                            className="relative rounded-t-[30px] -mb-[40px] z-0"
                        />
                        <div
                            className="absolute top-5 left-5 w-[111px] h-[32px] bg-[#FFFFFF] rounded-[50px] text-[#F09814] font-[700] flex justify-center items-center z-20 cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            Top Rated
                        </div>
                        <div
                            className="absolute top-5 right-5 size-[32px] bg-[#FFFFFFD1] rounded-full flex justify-center items-center cursor-pointer"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <img src={heart} />
                        </div>

                        <div
                            className="relative xl:w-[390px] xl:h-[259px] bg-[#FFFFFF] rounded-[30px] z-10 p-10"
                            style={{
                                boxShadow:
                                    "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div
                                className="absolute -top-5 right-10 w-[169px] h-[36px] bg-[#FFFFFF] rounded-[50px] text-[#000000] flex flex-row justify-center items-center gap-2 text-[14px] font-[700]"
                                style={{
                                    boxShadow:
                                        "0px 2px 2px 0px rgba(0, 0, 0, 0.25)",
                                }}
                            >
                                <img src={yellowStar} />
                                <h1>
                                    4.96{" "}
                                    <span className="font-[500] text-[#737373]">
                                        (672 reviews)
                                    </span>
                                </h1>
                            </div>

                            <h1 className="text-[24px]/[32px] font-[800]">
                                Grand Canyon Horseshoe Bend 2 days
                            </h1>

                            <div className="flex flex-row justify-start items-center gap-5 text-[16px] font-[500] text-[#737373] my-3">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={clock} />
                                    <h1>2 days 3 nights</h1>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={person} />
                                    <h1>4-6 guest</h1>
                                </div>
                            </div>

                            <div className="my-10 flex flex-row justify-between">
                                <h1 className="text-[24px] font-[800] ">
                                    $48.25{" "}
                                    <span className="text-[#737373] font-[500]">
                                        {" "}
                                        / person
                                    </span>
                                </h1>
                                <div className="w-[104px] h-[40px] bg-[#F2F4F6] rounded-[50px] font-[700] text-[14px] flex justify-center items-center border-[1px] border-[#E4E6E8] cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-[150px] h-[45px] bg-[#0955AC] border-[1px] border-[#0955AC] rounded-[9px] text-[16px] text-[#FFFFFF] font-[700] flex justify-center items-center cursor-pointer">
                VIEW MORE
            </div>
        </div>
    );
};

export default Recommended;
