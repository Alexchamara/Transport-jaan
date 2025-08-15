import React, { useState } from "react";
import proPic from "../../assets/vehicleDetails/proPic.png";
import stars from "../../assets/vehicleDetails/stars.png";
import arrow from "../../assets/landVehicleDetails/arrow.svg"

const ReviewSection = () => {
    const [showMore, setShowMore] = useState(false);

    const reviews = [
        {
            id: 1,
            name: "Kasun Gunawardhana",
            location: "Sri Lanka",
            date: "21 July 2022",
            rating: 5,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            id: 2,
            name: "Kasun Gunawardhana",
            location: "Sri Lanka",
            date: "21 July 2022",
            rating: 5,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            id: 3,
            name: "John Doe",
            location: "United States",
            date: "15 August 2022",
            rating: 4,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            id: 4,
            name: "Sarah Johnson",
            location: "Canada",
            date: "10 September 2022",
            rating: 5,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            id: 5,
            name: "Michael Chen",
            location: "Australia",
            date: "5 October 2022",
            rating: 4,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            id: 6,
            name: "Sarah Johnson",
            location: "Canada",
            date: "10 September 2022",
            rating: 5,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            id: 7,
            name: "Michael Chen",
            location: "Australia",
            date: "5 October 2022",
            rating: 4,
            comment:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
    ];

    // Show only first 2 reviews initially, show all when expanded
    const displayedReviews = showMore ? reviews : reviews.slice(0, 4);

    return (
        <div className="plus-jakarta-sans w-auto h-auto xl:h-auto rounded-[10px] py-5 ">
            {displayedReviews.map((review) => (
                <div
                    key={review.id}
                    className="flex flex-col gap-3 py-5 text-[12px] font-[500]"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex flex-row gap-3 items-center">
                            <img src={proPic} alt="Profile" />
                            <div className="flex flex-col items-start gap-2">
                                <h1 className="text-[14px] font-[700]">
                                    {review.name}
                                </h1>
                                <h1 className="text-[#90A3BF]">
                                    {review.location}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-col items-start lg:items-end gap-2">
                            <h1 className="text-[#90A3BF]">{review.date}</h1>
                            <img src={stars} alt="Rating" />
                        </div>
                    </div>
                    <div>
                        <p className="font-[400] text-[12px]/[33px] text-justify">
                            {review.comment}
                        </p>
                    </div>
                </div>
            ))}

            {reviews.length > 2 && (
                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="text-[#0955AC] text-[14px] font-[700] border-[1.5px] w-[175px] h-[47px] justify-center rounded-[8px] border-[#0955AC] transition-colors duration-200 flex items-center gap-2"
                    >
                        <span>
                            {showMore ? "Show Less Reviews" : "See All Reviews"}
                        </span>
                        <img
                            src={arrow}
                            alt="Arrow"
                            className={`size-[24px] transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
