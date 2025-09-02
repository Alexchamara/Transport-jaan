import React from "react";

const PoliciesTab = () => (
    <>
        <div className="poppins text-[14px] font-[400] text-justify p-3 md:p-0">
            <h1 className="text-[20px] font-[600]">Added Important Information</h1>
            <p className="pt-10">
                This document contains the information you and additional drivers need to know about your rental. You should read this document together with the rental terms and conditions. You can find a sample of the rental terms and conditions by going to www.avis.ch. If you received a booking confirmation email it may contain a link to this sample. Please note the sample rental terms and conditions are an indication of the terms of the contract and may not contain the exact terms you will be asked to sign when you pick up the vehicle.
            </p>
            <p className="py-10">
                It is important to us that you enjoy your experience with us and have all the information you need. It might take you a little time now but it could save you time later.
            </p>
            <h1 className="text-[#F50505] font-[600] mb-2">Important to Know</h1>
            <p>
                The company that provides you with a rental vehicle is Avis Budget Autovermietung AG, Hofwisenstrasse 36, 8153 Rümlang, CH. This may not be the same one that you made your booking with. The prices in this document are subject to change – but they'll give you a good idea of what to expect. For exact prices, please contact the rental location or contact the Reservations team. All prices include VAT, where it's charged.
            </p>
            <p className="text-[#F23E3E] mt-10">
                To make a booking, change a booking or tell us about an issue while you're renting, contact the rental station or the Reservations team:
            </p>
            <div className="flex flex-col gap-2 py-2">
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                    <h1>Fill in the online form which can be found at www.avis.ch/en/ and click on "Contact Us"</h1>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                    <h1>Call on 0848 81 18 18 (CHF 0.08 min), from outside Sri Lanka: +94 77 300 1234</h1>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                    <h1>Lines are open 8.00 am to 6.00 pm CET, Monday to Friday.</h1>
                </div>
            </div>
            <div className="py-10">
                <h1>You will find the contact details for the rental station on your rental agreement.</h1>
                <h1 className="text-[#F50505] mt-2">To tell us about an issue after you've returned the vehicle, please contact the customer service team:</h1>
                <div className="flex flex-col gap-2 py-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                        <h1>Email: customer.service@avis.ch</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                        <h1>Fill in the online form which can be found at www.avis.ch/en/ and click on "Contact Us"</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                        <h1>Call on 044 809 19 01, from outside Switzerland: +41 (0) 44 809 19 01.</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                        <h1>Lines are open 9.00 am to 5.00 pm CET, Monday to Friday.</h1>
                    </div>
                </div>
            </div>
        </div>
        {/* 2 section */}
        <div className="text-[14px] flex flex-col gap-8">
            <div>
                <h1 className="text-[20px] font-[600] pb-8">Age Information</h1>
                <h1 className="text-[#F50505]">How old do you need to be to drive a rental vehicle?</h1>
                <p className="mt-2 mb-5">
                    To drive our vehicles, you – and all of your drivers - need to be at least 21 years old and have held a full, valid driving license for at least ½ year at the start of your rental. Higher as well as lower minimum age limits as well as a minimum holding period of 3 years may apply to certain vehicles.
                </p>
            </div>
            <div>
                <h1 className="text-[#F50505]">How do you know if there are minimum age restrictions on my rental?</h1>
                <p className="mt-2 mb-5">
                    When you book, you'll be told if there are any minimum age restrictions for the vehicle you request. If you're not sure, please check your booking confirmation email – or call the Reservations team.
                </p>
            </div>
            <div>
                <h1 className="text-[#F50505]">If you under 25; do you need to pay a young driver surcharge?</h1>
                <p className="mt-2">
                    If you – or any of your drivers – are under 25 when you pick up the vehicle, you will each have to pay a young driver surcharge. The cost for this will depend on where you're picking the vehicle up from – but you can expect it to be between CHF 20.00 and CHF 24.00 per day.
                </p>
                <p className="">
                    If you rent the vehicle for more than 10 days, you'll only be charged for a maximum of 10 days and get cover for the duration of your rental, up to 28 days.
                </p>
            </div>
            <div>
                <h1 className="text-[#F50505]">Maximum age restrictions</h1>
                <p className="mt-2">
                    As long as you hold a full, valid driving licence for at least ½ year or 3 years with regard to certain vehicles.
                </p>
            </div>
            <div>
                <h1 className="text-[20px] font-[600] mt-10 pb-8">Driving license and ID requirements</h1>
                <h1 className="text-[#F50505]">How old do you need to be to drive a rental vehicle?</h1>
                <p className="mt-2 mb-10">
                    To drive our vehicles, you – and all of your drivers - need to be at least 21 years old and have held a full, valid driving licence for at least ½ year at the start of your rental. Higher as well as lower minimum age limits as well as a minimum holding period of 3 years may apply to certain vehicles.
                </p>
                <h1 className="text-[#F50505]">How do you know if there are minimum age restrictions on my rental?</h1>
                <p className="mt-2 mb-5">
                    When you book, you'll be told if there are any minimum age restrictions for the vehicle you request. If you're not sure, please check your booking confirmation email – or call the Reservations team.
                </p>
            </div>
        </div>
    </>
);

export default PoliciesTab; 