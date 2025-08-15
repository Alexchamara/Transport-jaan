import React, { useState } from "react";
import downArrow from "../../assets/freight/downArrow.svg";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in."
        },
        {
            question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ?",
           answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in."
        },
        {
            question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in."
        },
        {
            question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in."
        },
        {
            question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ?",
            answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in."
        },
    ];

    return (
        <div className="h-auto flex flex-col justify-center items-center px-20 py-20">
            <h1 className="bebas-neue text-[40px] font-[400]">FAQ</h1>
            <p className="text-[14px] font-[14px]/[33px] lg:w-[763px] text-center">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                semper eu risus ut ornare. In bibendum tempus sapien, tristique
                consectetur purus pellentesque ac. Quisque facilisis laoreet
                feugiat.{" "}
            </p>

            <div className="pt-10 text-[16px]/[33px] poppins flex flex-col justify-center items-center gap-5">
                {faqs.map((faq, idx) => (
                    <div key={idx}>
                        <div
                            className="xl:w-[1214px] xl:h-[75px] bg-[#0955AC33] rounded-[10px] flex flex-col md:flex-row justify-between items-center px-20 py-5 cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        >
                            <h1>{faq.question}</h1>
                            <img 
                                src={downArrow} 
                                className={`size-[10px] transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`} 
                            />
                        </div>
                        {openIndex === idx && (
                            <h1 className="xl:w-[1214px] px-20 py-2 flex justify-center items-center text-justify">
                                {faq.answer}
                            </h1>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
