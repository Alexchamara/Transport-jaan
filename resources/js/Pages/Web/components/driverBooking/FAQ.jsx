import React, { useState } from "react";
import sideArrow from "../../assets/driverBooking/sideArrow.svg";
import sideWhiteArrow from "../../assets/driverBooking/sideWhiteArrow.svg"

const FAQ = () => {
    const [expandedItem, setExpandedItem] = useState(0);

    const faqData = [
        {
            question: "How do I book a driver?",
            answer: "Booking a driver is simple! You can book through our website or mobile app. Just select your pickup location, destination, date, and time. Choose from our verified drivers and confirm your booking. You'll receive instant confirmation and driver details."
        },
        {
            question: "Can I hire a driver for a few hours or a whole day?",
            answer: "Yes, absolutely! We offer flexible booking options. You can hire a driver for as little as 2 hours or for the entire day. We also provide overnight and multi-day services. Simply specify your requirements during booking and we'll accommodate your needs."
        },
        {
            question: "Are your drivers background checked?",
            answer: "Yes, all our drivers undergo comprehensive background checks including criminal history, driving record verification, and identity verification. We also conduct regular drug tests and maintain strict safety standards to ensure your security and peace of mind."
        },
        {
            question: "What if I need a driver on short notice?",
            answer: "We understand emergencies happen! We offer last-minute booking services with drivers available within 30-60 minutes in most areas. Simply use our 'Quick Book' feature or call our 24/7 customer service line for immediate assistance."
        }
    ];

    const toggleItem = (index) => {
        setExpandedItem(expandedItem === index ? -1 : index);
    };

    return (
        <div className="bg-[#E7E7E7] flex flex-col justify-center items-center px-5 py-10">
            <h1 className="bebas-neue text-[40px] font-[400]">
                <span className="text-[#0955AC]">Have</span> a question{" "}
                <span className="text-[#0955AC]">for us? </span>
                Let us <span className="text-[#0955AC]">know</span>
            </h1>
            <p className="text-[#0F0F0F80] text-center py-10">
                Renting a luxury car has never been easier. Our streamlined
                process makes it simple for you to book and confirm <br /> your
                vehicle of choice online
            </p>

            <div className="inter flex flex-col gap-5 text-[15px] md:text-[20px] font-[600]">
                {faqData.map((item, index) => (
                    <div key={index} className="xl:w-[835px] lg:w-[635px] w-full bg-[#FFFFFF] rounded-[16px] overflow-hidden">
                        <div 
                            className="lg:h-[86px] flex flex-row justify-between items-center px-10 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleItem(index)}
                        >
                            <h1>{item.question}</h1>
                            <div className={`size-[34px] rounded-full flex justify-center items-center transition-all duration-300 ${expandedItem === index ? 'bg-[#0955AC]' : 'bg-[#F1F2F9]'}`}>
                                <img 
                                    src={expandedItem === index ? sideWhiteArrow : sideArrow} 
                                    alt="expand" 
                                    className={`transition-transform duration-300 ${expandedItem === index ? '' : 'rotate-90'}`}
                                />
                            </div>
                        </div>
                        {expandedItem === index && (
                            <div className="px-10 pb-5">
                                <p className="text-[16px] font-[400] text-[#6F6C8F] leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
