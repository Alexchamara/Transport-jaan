import React from "react";
import img1 from "../../assets/freight/img1.svg";
import img2 from "../../assets/freight/img2.svg";
import img3 from "../../assets/freight/img3.svg";

const Brands = () => {
    return (
        <div className="flex flex-col justify-center items-center px-5 py-5 xl:py-10">
            <h1 className="bebas-neue text-[40px] font-[400]">trusted by</h1>
            <div className="hidden xl:flex flex-col gap-5 mt-5">
                <div className="flex flex-row gap-5">
                    <img src={img1} className="w-[230px]" />
                    <img src={img2} className="w-[230px]" />
                    <img src={img3} className="w-[230px]"/>
                    <img src={img2} className="w-[230px]"/>
                    <img src={img1} className="w-[230px]"/>
                </div>
                <div className="flex flex-row gap-5">
                    <img src={img2} className="w-[230px]" />
                    <img src={img3} className="w-[230px]"/>
                    <img src={img1} className="w-[230px]" />
                    <img src={img3} className="w-[230px]" />
                    <img src={img2} className="w-[230px]" />
                </div>
            </div>


            {/* lg */}
            <div className="flex xl:hidden flex-col gap-5 mt-5">
                <div className="flex flex-col md:flex-row gap-5">
                    <img src={img1} />
                    <img src={img2} />
                    <img src={img3} />
                </div>
                <div className="flex flex-col md:flex-row justify-center  gap-5">
                    <img src={img2} />
                    <img src={img1} />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                    <img src={img2} />
                    <img src={img3} />
                    <img src={img1} />
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-5">
                    <img src={img3} />
                    <img src={img2} />
                </div>
            </div>
        </div>
    );
};

export default Brands;
