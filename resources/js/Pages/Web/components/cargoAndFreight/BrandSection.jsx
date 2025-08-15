import React from "react";
import logoOne from "../../assets/cargoAndFreight/logoOne.png"
import logoTwo from "../../assets/cargoAndFreight/logoTwo.png"
import logoThree from "../../assets/cargoAndFreight/logoThree.png"
import logoFour from "../../assets/cargoAndFreight/logoFour.png"
import logoFive from "../../assets/cargoAndFreight/logoFive.png"
import logoSix from "../../assets/cargoAndFreight/logoSix.png"

const BrandSection = () => {
    return (
        <div className="w-full h-[128px] flex justify-center items-center bg-[#0955AC38]">
            <div className="flex flex-row gap-10 justify-center items-center">
              <img src={logoOne}  />
              <img src={logoTwo} />
              <img src={logoThree} />
              <img src={logoFour} />
              <img src={logoFive} />
              <img src={logoSix} />
            </div>
        </div>
    );
};

export default BrandSection;
