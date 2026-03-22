import React, { useState } from "react";
import upArrow from "../../assets/landingPages/upArrow.svg";

import "./landingPages.css";

// FAQ data array
const faqData = [
    {
        question: "What services does your platform offer?",
        answer: "We provide an all-in-one transport solution including vehicle rental, ticket booking, courier services, warehouse booking, freight management, and multimodal transport options.",
    },
    {
        question: "How do I book a vehicle or transport service?",
        answer: "Simply select the service you need, enter your pickup and destination details, choose your preferred option, and confirm the booking online within minutes.",
    },
    {
        question: "Are the prices shown on the website final?",
        answer: "Yes, all prices are displayed transparently. Any additional charges, if applicable, will be clearly shown before you confirm your booking",
    },
    {
        question: "Can I track my courier or freight shipment?",
        answer: "Yes. Real-time tracking is available for courier and freight shipments, allowing you to monitor the status from pickup to final delivery.",
    },
    {
        question: "What types of vehicles are available for rental?",
        answer: "We offer cars, vans, pickups, and trucks suitable for personal use, business travel, and commercial transportation.",
    },
];

// FAQ data array
const faqDataTwo = [
    {
        question: "Do you support logistic shipments?",
        answer: "Yes. Our courier and freight services support both domestic and logistic shipments via air and sea transport.",
    },
    {
        question: "Is warehouse storage available for short-term use?",
        answer: "Absolutely. You can book warehouse space for short-term or long-term storage based on your business requirements.",
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept secure online payments including cards, bank transfers, and other supported digital payment methods.",
    },
    {
        question: "Can I combine multiple transport modes in one booking?",
        answer: "Yes. Our multimodal service allows you to combine land, air, and sea transport into a single optimized booking.",
    },
    {
        question: "How can I get customer support if I need help?",
        answer: "Our support team is available via phone, email, or live chat to assist you with bookings, tracking, and general inquiries.",
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
        <div className="poppins py-5 px-10">
            <div>
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="xl:w-[112px] w-[50px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] font-[600] uppercase">
                        FAQ
                    </h1>
                    <div className="xl:w-[112px] w-[50px] h-[1.8px] bg-[#FF7003]" />
                </div>
                <div className="flex justify-center items-center py-10">
                    <h1 className="text-[12px] xl:text-[17px] font-[300] text-[#F5B7877D] xl:w-[930px] text-center">
                        Have questions? We’ve answered the most common ones to
                        help you book and manage your transport services with
                        ease.
                    </h1>
                </div>

                <div className="flex md:flex-row flex-col justify-center items-center gap-5 py-10">
                    {/* FAQ section */}
                    <div className="flex flex-col gap-5">
                        {faqData.map((faq, idx) => (
                            <div
                                key={idx}
                                className={`w-auto text-justify ${
                                    openIndex === idx
                                        ? "border-[1px] border-[#0955AC] rounded-[10px]"
                                        : ""
                                }`}
                            >
                                <div
                                    className={`2xl:w-[628px] xl:w-[500px] w-auto xl:h-[63px] ${
                                        openIndex === idx
                                            ? ""
                                            : "border-[1px] border-[#0955AC] rounded-[10px] box-shadow"
                                    } flex flex-row gap-5 items-center justify-between py-2 px-4 cursor-pointer`}
                                    onClick={() => handleToggle(idx)}
                                >
                                    <h1 className="text-[12px] xl:text-[16px]">
                                        {faq.question}
                                    </h1>
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
                                    <h1 className="text-[10px] xl:text-[12px]/[33px] font-[400] 2xl:w-[628px] xl:w-[500px] w-auto px-10 py-5">
                                        {faq.answer}
                                    </h1>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* FAQ section two */}
                    <div className="flex flex-col gap-5">
                        {faqDataTwo.map((faq, idx) => (
                            <div
                                key={idx}
                                className={`w-auto text-justify ${
                                    openIndexTwo === idx
                                        ? "border-[1px] border-[#0955AC] rounded-[10px]"
                                        : ""
                                }`}
                            >
                                <div
                                    className={`2xl:w-[628px] xl:w-[500px] w-auto xl:h-[63px] ${
                                        openIndexTwo === idx
                                            ? ""
                                            : "border-[1px] border-[#0955AC] rounded-[10px] box-shadow"
                                    } flex flex-row gap-5 items-center justify-between py-2 px-4 cursor-pointer`}
                                    onClick={() => handleToggleTwo(idx)}
                                >
                                    <h1 className="text-[12px] xl:text-[16px]">
                                        {faq.question}
                                    </h1>
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
                                    <h1 className="text-[10px] xl:text-[12px]/[33px] 2xl:w-[628px] xl:w-[500px] w-auto font-[400] px-10 py-5">
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
