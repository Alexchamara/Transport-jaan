import React from "react";
import img1 from "../../assets/freight/img1.svg";
import img2 from "../../assets/freight/img2.svg";
import img3 from "../../assets/freight/img3.svg";

const Brands = () => {
    return (
        <div className="flex flex-col justify-center items-center px-10 py-10">
            <h1 className="bebas-neue text-[40px] font-[400]">trusted by</h1>
            <div className="flex flex-col gap-10 mt-5">
                <div className="flex flex-col xl:flex-row gap-10">
                    <img src={img1} />
                    <img src={img2} />
                    <img src={img3} />
                    <img src={img2} />
                    <img src={img1} />
                </div>
                <div className="flex flex-col xl:flex-row gap-10">
                    <img src={img2} />
                    <img src={img3} />
                    <img src={img1} />
                    <img src={img3} />
                    <img src={img2} />
                </div>
            </div>
        </div>
    );
};

export default Brands;
