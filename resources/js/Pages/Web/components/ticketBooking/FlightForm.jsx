import React from "react";

const FlightForm = () => {
    return (
        <div className="p-20">
            <form
                className="figtree flex flex-col justify-center items-center bg-white p-4 sm:p-6 rounded-[15px] w-full h-auto text-[#286BB6] text-[13px] font-[400]"
                style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                    <label className="block mb-1">Your Name *</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Your Email *</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Subject *</label>
                        <input
                            type="text"
                            placeholder="Enter subject"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                </div>

                <div className="w-full mb-4">
                    <label className="block mb-1">Special Requests</label>
                    <textarea
                        placeholder="Any special requests"
                        className="w-full border rounded-[8px] p-[16px]"
                        rows="3"
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">One way / Return *</label>
                        <select
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        >
                            <option value="">Select option</option>
                            <option value="oneway">One way</option>
                            <option value="return">Return</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Departure Date *</label>
                        <input
                            type="date"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-4">
                    <div>
                        <label className="block mb-1">
                            Departure Airport *
                        </label>
                        <input
                            type="text"
                            placeholder="Enter departure airport"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Arriving Airport *</label>
                        <input
                            type="text"
                            placeholder="Enter arriving airport"
                            className="w-full border rounded-[8px] p-[16px]"
                            required
                        />
                    </div>
                </div>

    <div className="w-full mb-6">
                    <label className="block mb-1">Return Date</label>
                    <input
                        type="date"
                        className="w-full border rounded-[8px] p-[16px]"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-[#0955AC] text-white font-bold h-[56px] w-full rounded-[8px] hover:bg-[#07448a] transition-colors"
                >
                    Start
                </button>
            </form>
        </div>
    );
};

export default FlightForm;
