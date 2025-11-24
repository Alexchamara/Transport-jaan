import React from "react";
import firstImg from "../../assets/courierService/1.png";
import secondImg from "../../assets/courierService/2.png";
import thirdImg from "../../assets/courierService/3.png";

const Services = () => {
    return (
    <div className="bg-[#E7E7E7] py-10 px-4 md:px-20"> 
        <div className="flex flex-col justify-center items-center">
            <h1 className="bebas-neue text-center text-[40px]/[130%] font-[400]">
                OUR <span className="text-[#0955AC]"> Services</span>
            </h1>
            
            <p className="mt-4 text-center text-[14px] leading-[20px] xl:text-[16px] xl:leading-[24px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Donec semper eu risus ut ornare. In bibendum ,
                <br /> tempus sapien, tristique consectetur purus
                pellentesque ac
            </p>
        
            <div className="flex flex-col lg:flex-row justify-center items-center py-10 xl:gap-10 gap-8 w-full">
                
                {/* Card 1 */}
                
                <div className="w-full max-w-[378px] bg-[#F5F5F5] rounded-[21px] flex flex-col justify-start items-center p-6 my-4"> 
                    
                    <img src={firstImg} className="w-[100px] h-auto mb-4" /> 
                    
                    <div className="w-full py-5 text-center">
                        <h1 className="bebas-neue text-[#0F0F0F] text-[24px]">
                            parcel delivery
                        </h1>
                        
                        <p className="text-[14px] leading-6 poppins text-justify mt-2">
                            Lorem ipsum dolor sit amet, consectetur
                            adipiscing elit. Donec semper eu risus ut
                            ornare. In bibendum tempus sapien,{" "}
                        </p>
                    </div>
                </div>
        
                {/* Card 2 */}
                <div className="w-full max-w-[378px] bg-[#F5F5F5] rounded-[21px] flex flex-col justify-start items-center p-6 my-4">
                    <img src={secondImg} className="w-[100px] h-auto mb-4" />
                    
                    <div className="w-full py-5 text-center">
                        <h1 className="bebas-neue text-[#0F0F0F] text-[24px]">
                            Logistic service
                        </h1>
                        <p className="text-[14px] leading-6 poppins text-justify mt-2">
                            Lorem ipsum dolor sit amet, consectetur
                            adipiscing elit. Donec semper eu risus ut
                            ornare. In bibendum tempus sapien,{" "}
                        </p>
                    </div>
                </div>
        
                {/* Card 3 */}
                <div className="w-full max-w-[378px] bg-[#F5F5F5] rounded-[21px] flex flex-col justify-start items-center p-6 my-4">
                    <img src={thirdImg} className="w-[100px] h-auto mb-4" />
                    
                    <div className="w-full py-5 text-center">
                        <h1 className="bebas-neue text-[#0F0F0F] text-[24px]">
                            warehouse
                        </h1>
                        <p className="text-[14px] leading-6 poppins text-justify mt-2">
                            Lorem ipsum dolor sit amet, consectetur
                            adipiscing elit. Donec semper eu risus ut
                            ornare. In bibendum tempus sapien,{" "}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default Services;
