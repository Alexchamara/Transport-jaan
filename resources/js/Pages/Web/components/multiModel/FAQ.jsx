import React, { useState } from "react";
import bg from "../../assets/multiModel/FAQ/bg.png";
import upArrow from "../../assets/multiModel/FAQ/upArrow.svg";

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const faqs = [
        {
            question:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ? ",
            answer:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            question:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ? ",
            answer:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            question:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ? ",
            answer:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            question:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ? ",
            answer:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
        {
            question:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum ? ",
            answer:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.",
        },
    ];
    return (
        <div
            className="w-full min-h-[978px] relative flex flex-col justify-center items-center xl:p-20 p-5"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="w-full h-full absolute bg-[#00000087] z-10" />
            <div className="max-w-[1200px] flex flex-col justify-start items-center w-full z-20 text-center">
                <h1 className="bebas-neue text-[60px]/[58px] font-[400] text-white">
                    FAQ
                </h1>
                <p className="xl:text-[16px]/[33px] text-[12px] font-[600] poppins text-white max-w-[863px] text-center mt-5">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum tempus sapien,
                    tristique consectetur purus pellentesque ac. Quisque
                    facilisis laoreet feugiat.
                </p>

                <div className="w-full mt-10 flex flex-col gap-5">
                    {faqs.map((faq, index) => (
                        <div key={index}>
                            <div
                                className="w-full md:h-[75px] border-[1px] border-[#FFFFFF] flex flex-row gap-5 justify-between items-center rounded-[10px] bg-[#FFFFFF14] xl:px-20 px-5 py-2 cursor-pointer"
                                onClick={() =>
                                    setOpenIndex(openIndex === index ? -1 : index)
                                }
                            >
                                <h1 className="xl:text-[18px] text-[12px] font-[700] text-white">
                                    {faq.question}
                                </h1>
                                {openIndex === index ? (
                                    <img src={upArrow} />
                                ) : (
                                    <img src={upArrow} className="rotate-180" />
                                )}
                            </div>
                            <p
                                className={`xl:text-[16px]/[33px] text-[10px] font-[600] text-white text-justify mt-10 xl:px-10 ${
                                    openIndex === index ? "" : "hidden"
                                }`}
                            >
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;
