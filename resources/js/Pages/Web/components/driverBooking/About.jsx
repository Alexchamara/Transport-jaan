import React from "react";
import bg2 from "../../assets/driverBooking/bg2.png"

const About = () => {
    return (
        <div 
            className="lg:h-[357px] px-5 py-10 flex flex-col justify-center items-center gap-10"
            style={{
                backgroundImage: `url(${bg2})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <h1 className="bebas-neue text-[40px] font-[400]">
                {" "}
                <span className="text-[#0955AC]">About</span> Our{" "}
                <span className="text-[#0955AC]">Platform</span>
            </h1>
            <p className="poppins text-justify lg:w-[683px] text-[14px]/[33px] font-[400]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                semper eu risus ut ornare. In bibendum tempus sapien,
                tristique consectetur purus pellentesque ac. Quisque facilisis
                laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc
                tincidunt sit amet. Quisque congue sapien nec aliquet faucibus.
                Morbi lectus eros, accumsan eget malesuada et, fermentum eget
                nisl. Fusce vel placerat libero. Integer convallis sodales
                libero, vitae tristique massa hendrerit in.
            </p>
        </div>
    );
};

export default About;
