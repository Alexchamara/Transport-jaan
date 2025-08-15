import React from "react";
import happy from "../../assets/rentAVehicle/HowItWorks/happy.png";
import calendar from "../../assets/rentAVehicle/HowItWorks/calendar.png";
import search from "../../assets/rentAVehicle/HowItWorks/search.png";
import jeep from "../../assets/rentAVehicle/HowItWorks/jeep.png";

const HowItWorks = () => {
  return (
    <div className="w-full py-8 md:py-12">
      <div className="container mx-auto px-4">
        <h2 className="bebas-neue text-[32px] md:text-[40px] font-[400] text-center mb-4 md:mb-8">
          HOW IT <span className="text-[#0955AC]">WORKS</span>
        </h2>
        <p className="figtree text-center text-[14px] md:text-[15px] font-[400] text-[#0F0F0F80] mb-10 md:mb-20 px-4">
          Renting a luxury car has never been easier. Our streamlined process
          makes it simple for you to book and confirm <br/> your vehicle of
          choice online
        </p>
        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8 relative">
          {/* Steps */}
          <div className="w-full lg:w-1/2 space-y-4 md:space-y-6 relative z-10 lg:-mr-16 xl:-mr-32">
            {/* Step 1 */}
            <div className="flex items-center gap-3 md:gap-4 bg-[#FFFFFF] p-4 md:p-6 rounded-[24px] shadow">
              <div className="bg-[#F5F5F5] p-3 md:p-5 w-[50px] md:w-[57px] h-[90px] md:h-[106px] rounded-[16px] flex justify-center items-center">
                <img
                  src={search}
                  alt="Search Icon"
                  className="flex-shrink-0 h-[20px] w-[20px] md:h-[24px] md:w-[24px] object-contain"
                />
              </div>
              <div>
                <h3 className="figtree text-[20px] md:text-[24px] font-[700] mb-2 md:mb-3">
                  Browse and select
                </h3>
                <p className="figtree text-[#000000] text-[16px] md:text-[18px] font-[400]">
                  Choose from our wide range of premium cars, select the pickup
                  and return dates and locations that suit you best.
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex items-center gap-3 md:gap-4 bg-[#FFFFFF] p-4 md:p-6 rounded-[24px] shadow">
              <div className="bg-[#F5F5F5] p-3 md:p-5 w-[50px] md:w-[57px] h-[90px] md:h-[106px] rounded-[16px] flex justify-center items-center">
                <img
                  src={calendar}
                  alt="Calendar Icon"
                  className="flex-shrink-0 h-[20px] w-[20px] md:h-[24px] md:w-[24px] object-contain"
                />
              </div>
              <div>
                <h3 className="figtree text-[20px] md:text-[24px] font-[700] mb-2 md:mb-3">
                  Book and confirm
                </h3>
                <p className="figtree text-[#000000] text-[16px] md:text-[18px] font-[400]">
                  Book your desired car with just a few clicks and receive an
                  instant confirmation via email or SMS.
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex items-center gap-3 md:gap-4 bg-[#FFFFFF] p-4 md:p-6 rounded-[24px] shadow">
              <div className="bg-[#F5F5F5] p-3 md:p-5 w-[50px] md:w-[57px] h-[90px] md:h-[106px] rounded-[16px] flex justify-center items-center">
                <img
                  src={happy}
                  alt="Location Icon"
                  className="flex-shrink-0 h-[20px] w-[20px] md:h-[24px] md:w-[24px] object-contain"
                />
              </div>
              <div>
                <h3 className="figtree text-[20px] md:text-[24px] font-[700] mb-2 md:mb-3">
                  Enjoy your ride
                </h3>
                <p className="figtree text-[#000000] text-[16px] md:text-[18px] font-[400]">
                  Pick up your car at the designated location and enjoy your
                  premium driving experience with our top-quality service.
                </p>
              </div>
            </div>
          </div>
          {/* Image Placeholder */}
          <div
            className="md:w-2/3 w-full rounded-[24px] shadow flex items-center justify-center bg-no-repeat bg-[#F5F5F5] mt-6 lg:mt-0"
            style={{
              backgroundImage: `url(${jeep})`,
              height: "600px",
              width: "700px",
              backgroundPosition: "right",
              maxWidth: "100%"
            }}
          >
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
