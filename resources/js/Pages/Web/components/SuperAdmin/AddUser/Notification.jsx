import React, { useState } from "react";
import Help from "../../../assets/superAdmin/Help CenterB.svg";
import PhoneW from "../../../assets/superAdmin/Device Phone IconW.svg";
import MailB from "../../../assets/superAdmin/Mail IconB.svg";
import PhoneB from "../../../assets/superAdmin/Device Phone IconB.svg";
import MailW from "../../../assets/superAdmin/Mail Icon.svg";

const Notification = () => {
    // State for General Notifications
    const [generalOptions, setGeneralOptions] = useState({
        option1: { inAppActive: true, emailActive: false },
        option2: { inAppActive: false, emailActive: true },
        option3: { inAppActive: false, emailActive: true },
        option4: { inAppActive: true, emailActive: false },
    });

    // State for Summary Notifications
    const [summaryOptions, setSummaryOptions] = useState({
        option1: { inAppActive: true, emailActive: false },
        option2: { inAppActive: false, emailActive: true },
        option3: { inAppActive: false, emailActive: true },
        option4: { inAppActive: true, emailActive: false },
    });

    // Handlers for General Notifications
    const handleGeneralInAppClick = (option) => {
        setGeneralOptions((prev) => ({
            ...prev,
            [option]: { inAppActive: true, emailActive: false },
        }));
    };

    const handleGeneralEmailClick = (option) => {
        setGeneralOptions((prev) => ({
            ...prev,
            [option]: { inAppActive: false, emailActive: true },
        }));
    };

    // Handlers for Summary Notifications
    const handleSummaryInAppClick = (option) => {
        setSummaryOptions((prev) => ({
            ...prev,
            [option]: { inAppActive: true, emailActive: false },
        }));
    };

    const handleSummaryEmailClick = (option) => {
        setSummaryOptions((prev) => ({
            ...prev,
            [option]: { inAppActive: false, emailActive: true },
        }));
    };

    return (
            <div className="relative flex flex-col gap-12">
                <div className="poppins flex flex-col gap-6">
                    <div className="flex flex-col">
                        <h1 className="text-white text-[16px] font-500">
                            General Notifications
                        </h1>
                        <h1 className="text-[#AEB9E1] text-[14px] font-500">
                            Lorem ipsum dolor sit amet consectetur adipiscing.
                        </h1>
                    </div>

                <div className="w-[600px] h-[322px] border border-[#343B4F] bg-[#0B1739] rounded-[5px] flex justify-center py-6">
                    <div className="flex flex-col gap-[48px]">
                        {/* Option 1 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    I'm mentioned in a message
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleGeneralInAppClick("option1")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option1.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option1.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option1.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleGeneralEmailClick("option1")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option1.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option1.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option1.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Option 2 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    Someone replies to any message
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleGeneralInAppClick("option2")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option2.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option2.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option2.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleGeneralEmailClick("option2")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option2.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option2.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option2.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Option 3 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    I’m assigned a task
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleGeneralInAppClick("option3")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option3.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option3.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option3.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleGeneralEmailClick("option3")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option3.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option3.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option3.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Option 4 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    I'm mentioned in a message
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleGeneralInAppClick("option4")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option4.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option4.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option4.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleGeneralEmailClick("option4")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        generalOptions.option4.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={generalOptions.option4.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            generalOptions.option4.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="poppins flex flex-col gap-6">
                <div className="flex flex-col">
                    <h1 className="text-white text-[16px] font-500">
                        Summary Notifications
                    </h1>
                    <h1 className="text-[#AEB9E1] text-[14px] font-500">
                        Lorem ipsum dolor sit amet consectetur adipiscing.
                    </h1>
                </div>

                <div className="w-[600px] h-[322px] border border-[#343B4F] bg-[#0B1739] rounded-[5px] flex justify-center py-6">
                    <div className="flex flex-col gap-[48px]">
                        {/* Option 1 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    Daily summary
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleSummaryInAppClick("option1")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option1.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option1.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option1.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleSummaryEmailClick("option1")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option1.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option1.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option1.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Option 2 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    Weekly summary
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleSummaryInAppClick("option2")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option2.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option2.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option2.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleSummaryEmailClick("option2")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option2.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option2.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option2.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Option 3 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    Monthly summary
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleSummaryInAppClick("option3")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option3.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option3.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option3.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleSummaryEmailClick("option3")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option3.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option3.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option3.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Option 4 */}
                        <div className="flex flex-row justify-between items-center w-[543px] h-[30px]">
                            <div className="flex flex-row gap-1 items-center">
                                <h1 className="text-white text-[12px] font-500">
                                    Annually summary
                                </h1>
                                <img src={Help} className="size-[12px]" />
                            </div>
                            <div className="flex flex-row">
                                <button
                                    onClick={() => handleSummaryInAppClick("option4")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option4.inAppActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-l-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option4.inAppActive ? PhoneW : PhoneB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option4.inAppActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        In-app
                                    </h1>
                                </button>
                                <button
                                    onClick={() => handleSummaryEmailClick("option4")}
                                    className={`flex flex-row items-center gap-1 border ${
                                        summaryOptions.option4.emailActive
                                            ? "border-[#0955AC] bg-[#0955AC]"
                                            : "border-[#0B1739] bg-[#0A1330]"
                                    } py-[6px] px-[9px] rounded-r-[4px]`}
                                >
                                    <img
                                        src={summaryOptions.option4.emailActive ? MailW : MailB}
                                        className="size-[14px]"
                                    />
                                    <h1
                                        className={`text-[12px] font-500 ${
                                            summaryOptions.option4.emailActive
                                                ? "text-white"
                                                : "text-[#AEB9E1]"
                                        }`}
                                    >
                                        Email
                                    </h1>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex flex-row justify-end">
                <button className="w-[194px] h-[46px] text-white text-[16px] font-500 border border-[#0955AC] bg-[#0955AC] py-[14px] px-[60px] rounded-[5px]">
                    Add User
                </button>
            </div>
        </div>
    );
};


export default Notification;