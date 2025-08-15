import React from "react";
import star from "../../assets/driverBooking/star.svg";
import proPic from "../../assets/driverBooking/proPic2.svg";

const TestimonialCard = ({ testimonial, isMiddle = false }) => {
    return (
        <div 
            className={`${
                isMiddle 
                    ? 'xl:w-[398px] xl:h-[423px]' 
                    : 'lato xl:w-[280px] xl:h-[306px]'
            } bg-white rounded-[12px] py-5 px-5 flex flex-col justify-center items-center gap-5 transition-all duration-300 ease-in-out`}
        >
            <div className={`flex flex-col md:flex-row ${isMiddle ? 'justify-between' : 'justify-center'} items-end gap-3`}>
                <div className="flex flex-row justify-center items-center gap-3">
                    <img 
                        src={proPic} 
                        className={isMiddle ? "size-[72px]" : "size-[60px]"} 
                    />
                    <div className={isMiddle ? "text-[18px]" : "text-[12px]"}>
                        <h1 className={`${isMiddle ? "text-[24px]" : "text-[18px]"} font-[700]`}>{testimonial.name}</h1>
                        <h1 className="font-[400]">{testimonial.position}</h1>
                    </div>
                </div>
                <div className="flex flex-row justify-center items-center gap-2 mb-3">
                    <img src={star} className={isMiddle ? "size-[22px]" : "size-[15px]"} />
                    <img src={star} className={isMiddle ? "size-[22px]" : "size-[15px]"} />
                    <img src={star} className={isMiddle ? "size-[22px]" : "size-[15px]"} />
                    <img src={star} className={isMiddle ? "size-[22px]" : "size-[15px]"} />
                </div>
            </div>
            <h1 className={`${isMiddle ? 'text-[24px]' : 'text-[18px]'} font-[700]`}>
                {testimonial.title}
            </h1>
            <p className={`${isMiddle ? 'text-[18px]' : 'text-[12px]'} font-[400] text-center`}>
                {testimonial.text}
            </p>
        </div>
    );
};

export default TestimonialCard; 