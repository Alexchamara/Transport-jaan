import React, { useState } from "react";
import upArrow from "../../assets/landingPages/upArrow.svg";

import "./landingPages.css";

// FAQ data array
const faqData = [
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
];

// FAQ data array
const faqDataTwo = [
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
    {
        question:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper?",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit.",
    },
];

const FAQ = () => {
    // Track which FAQ is open; null means all are collapsed
    const [openIndex, setOpenIndex] = useState(null);

    const handleToggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    // Track which FAQ is open; null means all are collapsed
    const [openIndexTwo, setOpenIndexTwo] = useState(null);

    const handleToggleTwo = (idx) => {
        setOpenIndexTwo(openIndexTwo === idx ? null : idx);
    };

    return (
        <div className="poppins py-10 px-10">
            <div>
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="w-[112px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[40px] font-[600] uppercase">
                        FAQ
                    </h1>
                    <div className="w-[112px] h-[1.8px] bg-[#FF7003]" />
                </div>
                <div className="flex justify-center items-center py-10">
                    <h1 className="text-[17px] font-[300] text-[#F5B7877D] xl:w-[930px] text-center">
                        FLorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Donec semper eu risus ut ornare. In bibendum
                        tempus sapien, tristique consectetur purus pellentesque
                        ac.
                    </h1>
                </div>

                <div className="flex md:flex-row flex-col justify-center gap-5 py-10">
                    {/* FAQ section */}
                    <div className="flex flex-col gap-5">
                        {faqData.map((faq, idx) => (
                            <div key={idx} className={`w-auto text-justify ${openIndex === idx ? 'border-[1px] border-[#0955AC] rounded-[10px]' : ''}`}>
                                <div
                                    className={`xl:w-[628px] w-auto h-[63px] ${openIndex === idx ? '' : 'border-[1px] border-[#0955AC] rounded-[10px] box-shadow'} flex flex-row gap-5 items-center justify-between py-2 px-4 cursor-pointer`}
                                    onClick={() => handleToggle(idx)}
                                >
                                    <h1>{faq.question}</h1>
                                    <img
                                        src={upArrow}
                                        alt="Toggle FAQ"
                                        className={`transition-transform duration-200 ${
                                            openIndex === idx
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {openIndex === idx && (
                                    <h1 className="text-[12px]/[33px] font-[400]  xl:w-[628px]  px-10 py-5">
                                        {faq.answer}
                                    </h1>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* FAQ section two */}
                    <div className="flex flex-col gap-5">
                        {faqDataTwo.map((faq, idx) => (
                            <div key={idx} className={`w-auto text-justify ${openIndexTwo === idx ? 'border-[1px] border-[#0955AC] rounded-[10px]' : ''}`}>
                                <div
                                    className={`xl:w-[628px] w-auto h-[63px] ${openIndexTwo === idx ? '' : 'border-[1px] border-[#0955AC] rounded-[10px] box-shadow'} flex flex-row gap-5 items-center justify-between py-2 px-4 cursor-pointer`}
                                    onClick={() => handleToggleTwo(idx)}
                                >
                                    <h1>{faq.question}</h1>
                                    <img
                                        src={upArrow}
                                        alt="Toggle FAQ"
                                        className={`transition-transform duration-200 ${
                                            openIndexTwo === idx
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />
                                </div>
                                {openIndexTwo === idx && (
                                    <h1 className="text-[12px]/[33px] xl:w-[628px] font-[400] px-10 py-5">
                                        {faq.answer}
                                    </h1>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
