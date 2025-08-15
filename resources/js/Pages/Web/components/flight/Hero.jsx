import React from "react";
import bg from "../../assets/flight/bg.svg";

const Hero = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "auto",
                position: "relative",
                paddingTop: "100px",   //added padding to the top
                paddingBottom: "250px",   //added padding to the bottom
            }}
        >
            {/* Overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "#00000066",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
                <div className="flex flex-col xl:flex-row items-center justify-between px-20 py-10">
                    <div className="">
                        <div className="w-[125px] h-[5px] bg-[#FFFFFF] mb-6 rounded-sm"></div>
                        <h1 className="xl:w-[638px] bebas-neue text-[78px]/[70px] font-[400] mb-4">
                            Million <span className="text-[#FFFFFF]">of</span>{" "}
                            flights.
                            <span className="text-[#FFFFFF]">
                                one
                            </span> simple{" "}
                            <span className="text-[#FFFFFF]">search</span>.
                        </h1>
                        <p className="poppins py-5 xl:w-[628px] text-[12px]/[20px] md:text-[14px]/[33px] font-[400] text-[#FFFFFF] text-justify mb-10 md:mb-20">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. Morbi lectus eros,
                        </p>
                    </div>

                    {/* Search Form */}
                    <form
                        // onSubmit={onSubmit}
                        className="figtree flex flex-col justify-center items-center bg-white p-4 sm:p-6 rounded-[15px] w-full xl:w-[508px] h-auto text-[#286BB6] text-[13px] font-[400]"
                        style={{
                            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-4 mb-4">
                            {/* Pick-up Location */}
                            <div>
                                <label
                                    htmlFor="pickupLocation"
                                    className="block mb-1"
                                >
                                    Pick-up Location
                                </label>
                                <input
                                    type="text"
                                    id="pickupLocation"
                                    // value={formData.pickupLocation}
                                    // onChange={handleInputChange}
                                    placeholder="Search a location"
                                    className="appearance-none w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                                />
                            </div>
                            {/* Pick-up Date */}
                            <div>
                                <label
                                    htmlFor="pickupDate"
                                    className="block mb-1"
                                >
                                    Pick-up Date
                                </label>
                                <input
                                    type="text"
                                    id="pickupDate"
                                    // value={formData.pickupDate}
                                    // onChange={handleInputChange}
                                    placeholder="DD/MM/YYYY"
                                    className="w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => (e.target.type = "text")}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-4 mb-6">
                            {/* Drop-off Location */}
                            <div>
                                <label
                                    htmlFor="dropoffLocation"
                                    className="block mb-1"
                                >
                                    Drop-off Location
                                </label>
                                <input
                                    type="text"
                                    id="dropoffLocation"
                                    // value={formData.dropoffLocation}
                                    // onChange={handleInputChange}
                                    placeholder="Search a location"
                                    className="w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                                />
                            </div>
                            {/* Drop-off Date */}
                            <div>
                                <label
                                    htmlFor="dropoffDate"
                                    className="block mb-1"
                                >
                                    Drop-off Date
                                </label>
                                <input
                                    type="text"
                                    id="dropoffDate"
                                    // value={formData.dropoffDate}
                                    // onChange={handleInputChange}
                                    placeholder="DD/MM/YYYY"
                                    className="border-[1px] border-[#0000001A] rounded-[8px] p-[16px] w-full leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => (e.target.type = "text")}
                                />
                            </div>
                        </div>

                        {/* Find a Vehicle Button */}
                        <button
                            type="submit"
                            // onClick={handleFindVehicleClick}
                            className="bg-[#0955AC] text-white font-bold h-[56px] w-full rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#07448a] transition-colors"
                        >
                            Start
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Hero;
