import React from "react";
import icon1 from "../../assets/flight/icon1.svg";
import icon2 from "../../assets/flight/icon2.svg";
import icon3 from "../../assets/flight/icon3.svg";
import icon4 from "../../assets/flight/icon4.svg";

const Why = () => {
    return (
        <div className="bg-[#0955AC5C] flex flex-col xl:flex-row justify-between items-center px-[150px] py-20">
            <div>
                <div className="w-[195px] h-[52px] rounded-[10px] bg-[#0955AC] text-[16px] font-[700] text-[#FFFFFF] flex justify-center items-center">
                    <h1>WHY CHOOSE US ?</h1>
                </div>

                <h1 className="bebas-neue text-[52px]">
                    Embracing{" "}
                    <span className="text-[#0955AC]">
                        Adventure <br /> Since
                    </span>{" "}
                    2003
                </h1>
                <p className="text-[20px]/[32px] font-[500]">
                    Choose one style or create a package, fill your passports
                    with adventures together.
                </p>
                <div className="flex flex-col xl:flex-row gap-12 text-[16px]/[28px] text-[#737373] font-[700] py-10">
                    <div className="flex flex-col justify-center items-start gap-5">
                        <h1 className="text-[44px] font-[800] text-[#000000]">
                            45+
                        </h1>
                        <h1>
                            Global <br /> Branches
                        </h1>
                    </div>
                    <div className="flex flex-col justify-center items-start gap-5">
                        <h1 className="text-[44px] font-[800] text-[#000000]">
                            29K
                        </h1>
                        <h1>
                            Destinations
                            <br /> Collaboration
                        </h1>
                    </div>

                    <div className="flex flex-col justify-center items-start gap-5">
                        <h1 className="text-[44px] font-[800] text-[#000000]">
                            20+
                        </h1>
                        <h1>
                            Years
                            <br /> Experience
                        </h1>
                    </div>

                    <div className="flex flex-col justify-center items-start gap-5">
                        <h1 className="text-[44px] font-[800] text-[#000000]">
                            168K
                        </h1>
                        <h1>
                            Happy
                            <br /> Customers
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-10">
                <div className="flex flex-col gap-10 mt-10">
                    <div className="w-[280px] h-[213px] bg-[#FFF0EC] rounded-[16px] p-10 flex flex-col justify-center items-center gap-3">
                        <img src={icon1} />
                        <h1 className="text-[20px] font-[700]">
                            300,000+ Experiences
                        </h1>
                        <h1 className="text-[18px]/[28px] font-[500] text-[#737373] text-center">
                            Make memories around the world.
                        </h1>
                    </div>

                    <div className="w-[280px] h-[213px] bg-[#FDAF3B8A] rounded-[16px] p-10 flex flex-col justify-center items-center gap-3">
                        <img src={icon2} />
                        <h1 className="text-[20px] font-[700]">
                            Reserve now, Pay later
                        </h1>
                        <h1 className="text-[18px]/[28px] font-[500] text-[#737373] text-center">
                            Book your spot first, pay <br /> later.
                        </h1>
                    </div>
                </div>
                <div className="flex flex-col gap-10">
                    <div className="w-[280px] h-[213px] bg-[#E4F9F9] rounded-[16px] p-10 flex flex-col justify-center items-center gap-3">
                        <img src={icon3} />
                        <h1 className="text-[20px] font-[700]">
                            Trusted Reviews
                        </h1>
                        <h1 className="text-[18px]/[28px] font-[500] text-[#737373] text-center">
                            4.8 stars from 160,000+ Trustpilot reviews.
                        </h1>
                    </div>

                    <div className="w-[280px] h-[213px] bg-[#EFEFEB] rounded-[16px] p-10 flex flex-col justify-center items-center gap-3">
                        <img src={icon4} />
                        <h1 className="text-[20px] font-[700]">
                            Security Assurance
                        </h1>
                        <h1 className="text-[18px]/[28px] font-[500] text-[#737373] text-center">
                            Data security through encryption
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Why;
