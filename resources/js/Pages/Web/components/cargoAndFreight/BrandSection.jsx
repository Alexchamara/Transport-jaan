import React from "react";
import logoOne from "../../assets/cargoAndFreight/logoOne.png"
import logoTwo from "../../assets/cargoAndFreight/logoTwo.png"
import logoThree from "../../assets/cargoAndFreight/logoThree.png"
import logoFour from "../../assets/cargoAndFreight/logoFour.png"
import logoFive from "../../assets/cargoAndFreight/logoFive.png"
import logoSix from "../../assets/cargoAndFreight/logoSix.png"

const BrandSection = () => {
    return (
        <div className="w-full min-h-[128px] h-auto py-6 md:py-0 md:h-[128px] flex justify-center items-center bg-[#0955AC38]">
            <div className="flex flex-row flex-wrap gap-4 md:gap-10 justify-center items-center px-4 md:px-0">
              <img src={logoOne} className="h-8 md:h-auto w-auto" alt="Brand logo" />
              <img src={logoTwo} className="h-8 md:h-auto w-auto" alt="Brand logo" />
              <img src={logoThree} className="h-8 md:h-auto w-auto" alt="Brand logo" />
              <img src={logoFour} className="h-8 md:h-auto w-auto" alt="Brand logo" />
              <img src={logoFive} className="h-8 md:h-auto w-auto" alt="Brand logo" />
              <img src={logoSix} className="h-8 md:h-auto w-auto" alt="Brand logo" />
            </div>
        </div>
    );
};

export default BrandSection;
