import React, { useState } from "react";
import proPic1 from "../../assets/landingPages/proPic1.svg";
import leftArrow from "../../assets/landingPages/leftArrow.svg";

// Example reviews array
const reviews = [
    {
        name: "Steve Gibson",
        title: "Businessman",
        image: proPic1,
        text: `Their flight booking system is incredibly user-friendly, and I always get the best deals on last-minute tickets. The customer support team is responsive and helped me reschedule a flight during a tight deadline. Highly recommend for business travelers.`,
    },
    {
        name: "Maria Lopez",
        title: "Designer",
        image: proPic1,
        text: `As someone who travels for inspiration, I appreciate how they connect me to scenic bus routes across the country. The booking process is seamless, and their app keeps me updated on schedules. My recent trip through the mountains was unforgettable thanks to their reliable service.`,
    },
    {
        name: "John Smith",
        title: "Developer",
        image: proPic1,
        text: `Shipping my equipment for conferences used to be a nightmare until I found their freight services. Their tracking system is top-notch, and my packages always arrive on time and in perfect condition. The pricing is competitive, and their logistics team handles everything professionally.`,
    },
];

const Stories = () => {
    const [current, setCurrent] = useState(0);

    const handlePrev = () => {
        if (current > 0) {
            setCurrent(current - 1);
        }
    };

    const handleNext = () => {
        if (current < reviews.length - 1) {
            setCurrent(current + 1);
        }
    };

    const review = reviews[current];

    // Button color logic
    const leftButtonColor = current === 0 ? "#D9D9D9" : "#0955AC"; // blue if at start, grey otherwise
    const rightButtonColor =
        current === reviews.length - 1 ? "#D9D9D9" : "#0955AC"; // blue if at end, grey otherwise

    return (
        <div>
            <div className="poppins py-5 px-10">
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="xl:w-[112px] w-[50px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] font-[600] text-center uppercase">
                        Stories form our clinets
                    </h1>
                    <div className="xl:w-[112px] w-[50px] h-[1.8px] bg-[#FF7003]" />
                </div>

                <div className="flex flex-col xl:flex-row gap-10 justify-center items-center py-10 xl:px-20">
                    <button
                        className="hidden xl:flex size-[38px] rounded-full justify-center items-center"
                        style={{ backgroundColor: leftButtonColor }}
                        onClick={handlePrev}
                        aria-label="Previous review"
                        disabled={current === 0}
                    >
                        <img src={leftArrow} alt="Previous" />
                    </button>
                    <div className="flex flex-col justify-center items-center gap-10">
                        <img
                            src={review.image}
                            className="w-[90px] h-[90px]"
                            alt={review.name}
                        />
                        <p className="xl:w-[875px] text-[12px] xl:text-[22px] text-center">
                            {review.text}
                        </p>
                        <div className="flex flex-col items-center">
                            <h1 className="text-[18px] xl:text-[22px] font-[600]">
                                {review.name}
                            </h1>
                            <h1 className="text-[12px] xl:text-[14px]">
                                {review.title}
                            </h1>
                        </div>
                    </div>
                    <button
                        className="size-[38px] rounded-full hidden xl:flex justify-center items-center rotate-180"
                        style={{ backgroundColor: rightButtonColor }}
                        onClick={handleNext}
                        aria-label="Next review"
                        disabled={current === reviews.length - 1}
                    >
                        <img src={leftArrow} alt="Next" />
                    </button>

                    <div className="flex flex-row gap-5">
                        <button
                            className="size-[38px] rounded-full xl:hidden flex justify-center items-center"
                            style={{ backgroundColor: leftButtonColor }}
                            onClick={handlePrev}
                            aria-label="Previous review"
                            disabled={current === 0}
                        >
                            <img src={leftArrow} alt="Previous" />
                        </button>

                        <button
                            className="size-[38px] rounded-full xl:hidden flex justify-center items-center rotate-180"
                            style={{ backgroundColor: rightButtonColor }}
                            onClick={handleNext}
                            aria-label="Next review"
                            disabled={current === reviews.length - 1}
                        >
                            <img src={leftArrow} alt="Next" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stories;
