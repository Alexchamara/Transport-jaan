import React from "react";

const TrackForm = () => {
    return (
        <div className="bg-[#E7E7E7] py-20 px-20">
            <form method="POST" action={route("couriers.track")}>
                <div className="mb-4 flex flex-col md:flex-row justify-center items-center gap-5">
                    <input
                        type="text"
                        name="tracking_number"
                        id="tracking_number"
                        placeholder="Enter order number"
                        className="mt-1 block w-[300px] md:w-[768px] h-[59px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm placeholder-[#000000]"
                        required
                    />
                    <button
                        type="submit"
                        className="h-[59px] w-[160px] rounded-[10px] text-[18px] font-[400] text-[#FFFFFF] bg-[#0955AC]"
                    >
                        Track order
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrackForm;
