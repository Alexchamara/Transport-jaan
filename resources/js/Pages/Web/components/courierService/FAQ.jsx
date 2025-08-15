import React, { useState } from "react";
import dropDown from "../../assets/courierService/dropDown.png";

const FAQ = () => {
    const [selectedSection, setSelectedSection] = useState("General");
    const [expandedQuestions, setExpandedQuestions] = useState({});

    const toggleQuestion = (index) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const faqItems = {
        General: [
            {
                question: "How do I create an account with this?",
                answer: "Creating an account is simple! Just click on the 'Sign Up' button and follow the registration process. You'll need to provide your basic information and verify your email address to get started."
            },
            {
                question: "How does you ensure the security of my delivery?",
                answer: "We ensure delivery security through real-time tracking, secure payment processing, and verified delivery personnel. Each delivery is monitored throughout its journey, and we maintain detailed records of all transactions."
            },
            {
                question: "What type of deliveries can I perform using this?",
                answer: "Our platform supports various types of deliveries including food delivery, package delivery, document delivery, and more. You can choose the type of delivery that best suits your needs when placing an order."
            },
            {
                question: "What benefits do you offer for users?",
                answer: "We offer multiple benefits including competitive pricing, real-time tracking, flexible delivery options, secure payments, and 24/7 customer support. Our users also enjoy special discounts and loyalty rewards."
            }
        ],
        Clients: [
            {
                question: "How do I place a delivery order?",
                answer: "To place an order, log in to your account, select 'New Delivery', fill in the pickup and delivery details, choose your preferred rider, and confirm the order."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept various payment methods including credit/debit cards, digital wallets, and cash on delivery. All online payments are processed securely through our platform."
            },
            {
                question: "Can I track my delivery in real-time?",
                answer: "Yes! Once your order is confirmed, you'll receive a tracking link that allows you to monitor your delivery's location and status in real-time."
            },
            {
                question: "What if my delivery is delayed or damaged?",
                answer: "In case of delays or damages, please contact our support team immediately. We have a comprehensive insurance policy and will work to resolve any issues promptly."
            }
        ],
        Riders: [
            {
                question: "How do I become a rider?",
                answer: "To become a rider, you need to be at least 18 years old, have a valid driver's license, and pass our background check. Complete the registration process and submit the required documents."
            },
            {
                question: "How do I receive payment for deliveries?",
                answer: "Riders receive payments weekly through direct bank transfer. You can track your earnings in real-time through the rider dashboard."
            },
            {
                question: "What are the working hours?",
                answer: "As a rider, you have the flexibility to choose your working hours. You can work full-time or part-time, and select your preferred delivery zones."
            },
            {
                question: "What support do you provide to riders?",
                answer: "We provide 24/7 rider support, insurance coverage, regular training sessions, and access to our rider community for networking and support."
            }
        ]
    };

    return (
        <div className="bg-[#E7E7E7] py-10 px-20 pb-[100px]">
            <div className="flex flex-col justify-center items-center">
                <h1 className="bebas-neue text-[40px]/[130%] font-[400] py-5">
                    <span className="text-[#0955AC]"> frequently</span> asked{" "}
                    <span className="text-[#0955AC]"> questions</span>
                </h1>
                <div className="flex flex-col lg:flex-row lg:gap-40">
                    <div className="flex flex-col poppins text-[20px] font-[400] gap-2 justify-start items-start lg:px-12 py-12">
                        <h1 
                            className={`cursor-pointer ${selectedSection === "General" ? "text-black" : "text-[#8D8D8D]"}`}
                            onClick={() => setSelectedSection("General")}
                        >
                            General
                        </h1>
                        <h1 
                            className={`cursor-pointer ${selectedSection === "Clients" ? "text-black" : "text-[#8D8D8D]"}`}
                            onClick={() => setSelectedSection("Clients")}
                        >
                            Clients
                        </h1>
                        <h1 
                            className={`cursor-pointer ${selectedSection === "Riders" ? "text-black" : "text-[#8D8D8D]"}`}
                            onClick={() => setSelectedSection("Riders")}
                        >
                            Riders
                        </h1>
                    </div>
                    <div className="flex flex-col poppins text-[15px] lg:text-[24px] font-[400] lg:w-[655px]">
                        {faqItems[selectedSection].map((item, index) => (
                            <div key={index} className="border-b-[1px] border-[#000000]">
                                <div 
                                    className="flex flex-row justify-between items-center py-10 cursor-pointer"
                                    onClick={() => toggleQuestion(index)}
                                >
                                    <h1>{item.question}</h1>
                                    <img 
                                        src={dropDown} 
                                        className={`transition-transform duration-300 ${expandedQuestions[index] ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                {expandedQuestions[index] && (
                                    <div className="pb-10 text-[18px] text-[#666666]">
                                        {item.answer}
                                    </div>
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
