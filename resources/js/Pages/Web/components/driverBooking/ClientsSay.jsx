import React, { useState } from "react";
import left from "../../assets/driverBooking/left.svg"
import right from "../../assets/driverBooking/right.svg"
import TestimonialCard from "./TestimonialCard";

const ClientsSay = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Sample data for testimonials
    const testimonials = [
        {
            name: "Leo",
            position: "Lead Designer",
            title: "It was a very good experience",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nec turpis orci lectus maecenas. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. Faucibus venenatis felis id augue sit cursus pellentesque enim arcu. Elementum felis magna pretium in tincidunt. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu."
        },
        {
            name: "Sarah",
            position: "Marketing Manager",
            title: "Excellent service and quality",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nec turpis orci lectus maecenas. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. Faucibus venenatis felis id augue sit cursus pellentesque enim arcu. Elementum felis magna pretium in tincidunt. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu."
        },
        {
            name: "Mike",
            position: "Business Owner",
            title: "Highly recommended service",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nec turpis orci lectus maecenas. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. Faucibus venenatis felis id augue sit cursus pellentesque enim arcu. Elementum felis magna pretium in tincidunt. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu."
        },
        {
            name: "Emma",
            position: "Product Manager",
            title: "Outstanding experience",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nec turpis orci lectus maecenas. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. Faucibus venenatis felis id augue sit cursus pellentesque enim arcu. Elementum felis magna pretium in tincidunt. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu."
        },
        {
            name: "John",
            position: "Software Engineer",
            title: "Great value for money",
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nibh mauris, nec turpis orci lectus maecenas. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu. Faucibus venenatis felis id augue sit cursus pellentesque enim arcu. Elementum felis magna pretium in tincidunt. Suspendisse sed magna eget nibh in turpis. Consequat duis diam lacus arcu."
        }
    ];

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const getCardIndex = (displayIndex) => {
        const totalCards = testimonials.length;
        return (currentIndex + displayIndex + totalCards) % totalCards;
    };

    return (
        <div className="bg-[#E7E7E7] flex flex-col justify-center items-center px-5 py-10">
            <h1 className="bebas-neue text-[40px] font-[400]">
                <span className="text-[#0955AC]">What</span> client's{" "}
                <span className="text-[#0955AC]">Say about </span>
                us
            </h1>
            <p className="text-[#0F0F0F80] text-center py-10">
                Renting a luxury car has never been easier. Our streamlined
                process makes it simple for you to book and confirm <br /> your
                vehicle of choice online
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center gap-10">
                <TestimonialCard testimonial={testimonials[getCardIndex(-1)]} isMiddle={false} />
                <TestimonialCard testimonial={testimonials[getCardIndex(0)]} isMiddle={true} />
                <TestimonialCard testimonial={testimonials[getCardIndex(1)]} isMiddle={false} />
            </div>
            
            <div className="flex flex-row justify-center items-center gap-10 py-10">
                <img 
                    src={left} 
                    onClick={prevSlide}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                    alt="Previous"
                />
                <div className="flex flex-row justify-center items-center gap-5">
                    {testimonials.map((_, index) => (
                        <div 
                            key={index}
                            className={`size-[17px] rounded-full cursor-pointer transition-colors ${
                                index === currentIndex ? 'bg-[#525252]' : 'bg-[#C5C5C5]'
                            }`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
                <img 
                    src={right} 
                    onClick={nextSlide}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                    alt="Next"
                />
            </div>
        </div>
    );
};

export default ClientsSay;
