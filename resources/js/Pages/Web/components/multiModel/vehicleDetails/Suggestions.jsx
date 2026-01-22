import React from "react";

const Suggestions = ({ suggestedVehicles = [] }) => {
    if (suggestedVehicles.length === 0) {
        return null;
    }

    return (
        <div className="w-auto h-auto md:w-[440px] min-h-[643px] bg-[#F4F3F3] rounded-[19px] px-10 py-10">
            <h1 className="bebas-neue text-[30px]">
                you <span className="text-[#0955AC]">also</span> might{" "}
                <span className="text-[#0955AC]">like</span> this
            </h1>

            <div className="py-10 poppins">
                {/* Real vehicle suggestions will be added here when backend provides them */}
            </div>
        </div>
    );
};

export default Suggestions;