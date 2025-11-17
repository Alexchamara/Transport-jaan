import React, { useState } from "react";

import flightImage from "../../assets/rentAVehicle/flight.svg";
import trainImage from "../../assets/ticketBooking/train.jpg";
import busImage from "../../assets/ticketBooking/bus2.jpg";

import TrainCard from "../ticketBooking/TrainCard";
import BusCard from "../ticketBooking/BusCard";
import FlightCard from "../ticketBooking/FlightCard";

const VALID_TYPES = ["flight", "train", "bus"];

const Hero = ({ initialType = "flight" }) => {
  const safeInitial =
    VALID_TYPES.includes(initialType) ? initialType : "flight";

  // initial state depends on initialType (only on first render)
  const [selectedType, setSelectedType] = useState(safeInitial);
  const [imageOrder, setImageOrder] = useState(() => {
    const others = VALID_TYPES.filter((t) => t !== safeInitial);
    return [safeInitial, ...others]; // selected becomes the big image
  });

  const imageData = {
    flight: {
      src: flightImage,
      alt: "Flight",
      label: "Flight",
    },
    train: {
      src: trainImage,
      alt: "Train",
      label: "Train",
    },
    bus: {
      src: busImage,
      alt: "Bus",
      label: "Bus",
    },
  };

  const handleImageClick = (type) => {
    setSelectedType(type);
    setImageOrder((prevOrder) => {
      const newOrder = prevOrder.filter((t) => t !== type);
      newOrder.unshift(type);
      return newOrder;
    });
  };

  return (
    <div>
      {/* Content */}
      <div
        style={{ position: "relative", zIndex: 2 }}
        className="py-20 px-10 flex flex-col xl:flex-row gap-20 justify-center items-center overflow-hidden"
      >
        <div className="flex flex-col items-center max-w-[600px] xl:order-1 order-2">
          <div>
            <div className="w-[125px] h-[5px] bg-[#000000] mb-6 rounded-sm"></div>
            <h1 className="bebas-neue text-[68px]/[70px] font-[400] mb-4">
              Million <span className="text-[#0955AC]">of</span> flights.
              <span className="text-[#0955AC]"> one </span>
              simple <span className="text-[#0955AC]">search</span>.
            </h1>
            <p className="poppins py-5 text-[12px]/[20px] md:text-[14px]/[33px] font-[400] text-[#000000] text-justify mb-10">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              semper eu risus ut ornare. In bibendum tempus sapien, tristique
              consectetur purus pellentesque ac. Quisque facilisis laoreet
              feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit
              amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus
              eros,
            </p>
          </div>

          {/* Card section – controlled by selectedType */}
          <div className="w-full">
            {selectedType === "flight" && <FlightCard />}
            {selectedType === "train" && <TrainCard />}
            {selectedType === "bus" && <BusCard />}
          </div>
        </div>

        {/* Images Section */}
        <div className="xl:order-2 order-1 bebas-neue hidden md:flex flex-row items-stretch h-[500px] xl:h-[680px] gap-4 w-full md:w-1/2 flex-shrink-0">
          {imageOrder.map((type, idx) => (
            <div
              key={type}
              className={`relative h-full overflow-hidden rounded-[25px] shadow-lg transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0 ${
                idx === 0 ? "w-[459px]" : "w-[150px]"
              }`}
              onClick={() => handleImageClick(type)}
            >
              <img
                src={imageData[type].src}
                alt={imageData[type].alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#00000066]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-white text-[24px] lg:text-[32px] font-[400] rotate-[270deg] ${
                    idx === 0 ? "hidden" : ""
                  }`}
                >
                  {imageData[type].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
