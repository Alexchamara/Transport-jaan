import React, { useState } from "react";
import proPic1 from "../../assets/landingPages/proPic1.svg";
import leftArrow from "../../assets/landingPages/leftArrow.svg";

// Example reviews array
const reviews = [
    {
        name: "Steve Gibson",
        title: "Businessman",
        image: proPic1,
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing
elit. Donec semper eu risus ut ornare. In bibendum
tempus sapien, tristique consectetur purus
pellentesque ac. Quisque facilisis laoreet feugiat.
Sed dapibus volutpat ex, eget iaculis nunc tincidunt
sit amet. Quisque congue sapien nec aliquet
faucibus. Morbi lectus eros, accumsan eget malesuada
et, fermentum eget nisl. Fusce vel placerat libero.
Integer convallis sodales libero, vitae tristique
massa hendrerit in.`,
    },
    {
        name: "Maria Lopez",
        title: "Designer",
        image: proPic1,
        text: `Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam at dictum ex. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, nec dictum massa erat at dui.`,
    },
    {
        name: "John Smith",
        title: "Developer",
        image: proPic1,
        text: `Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Nulla porttitor accumsan tincidunt. Pellentesque in ipsum id orci porta dapibus. Morbi lectus eros, accumsan eget malesuada
et, fermentum eget nisl. Fusce vel placerat libero.
Integer convallis sodales libero, vitae tristique
massa hendrerit in.`,
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
            <div className="poppins py-20 px-10">
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="xl:w-[112px] w-[50px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[40px] font-[600] text-center uppercase">
                        Stories form our clinets
                    </h1>
                    <div className="xl:w-[112px] w-[50px] h-[1.8px] bg-[#FF7003]" />
                </div>

                <div className="flex flex-row gap-10 justify-center items-center py-10 px-20">
                    <button
                        className="size-[38px] rounded-full hidden md:flex justify-center items-center"
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
                        <p className="xl:w-[875px] text-center">
                            {review.text}
                        </p>
                        <div className="flex flex-col md:items-center items-start">
                            <h1 className="text-[22px] font-[600]">
                                {review.name}
                            </h1>
                            <h1 className="text-[14px]">{review.title}</h1>
                        </div>
                    </div>
                    <button
                        className="size-[38px] rounded-full hidden md:flex justify-center items-center rotate-180"
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
    );
};

export default Stories;
