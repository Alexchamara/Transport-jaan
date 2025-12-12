import React from "react";
import oLine from "../../../assets/landingPages/blogExample/oLine.svg";
import coverImg from "../../../assets/landingPages/blogExample/coverImg.svg";
import proPic from "../../../assets/landingPages/blogExample/proPic.svg";

const Hero = () => {
    return (
        <div className="py-10">
            {/* back button */}
            <div
                className="flex flex-row items-center gap-3 cursor-pointer px-5 xl:px-10 py-5"
                onClick={() => (window.location.href = "/landingPage/blog")}
            >
                <div className="size-[24px] rounded-full border-[2px] border-[#FF7003] flex justify-center items-center">
                    <img src={oLine} className="w-[8px] h-[13px]" />
                </div>
                <h1 className="text-[20px] font-[700] text-[#FF7003]">Blog</h1>
            </div>
            {/*  */}

            {/* image section */}
            <img src={coverImg} className="xl:h-[594px]" />

            <div className="xl:px-40 px-5 py-10">
                <h1 className="text-[48px] font-[700]">
                    Classic Revival: Revisiting Iconic Cars Through Modern
                    Reviews
                </h1>
                <div className="flex md:flex-row flex-col md:gap-10 gap-5 text-[20px] text-[#FFFFFF6E]">
                    <div className="flex flex-row items-center gap-3">
                        <img src={proPic} />
                        <h1 className=" font-[600]">Dasteen</h1>
                    </div>
                    <div className="flex flex-row items-center gap-3 plus-jakarta-sans">
                        <h1 className="font-[400]">
                            Jan 10, 2024{" "}
                            <span className="font-[700] rounded-full">∙</span> 3
                            min read
                        </h1>
                    </div>
                </div>

                <div className="xl:px-10 py-10 flex flex-col gap-5">
                    <h1 className="text-[36px]/[48px] font-[600] text-[#0955AC]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod.
                    </h1>
                    <p className="text-[16px]/[28px] text-[#6D6E76]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Non blandit massa enim nec. Scelerisque
                        viverra mauris in aliquam sem. At risus viverra
                        adipiscing at in tellus. Sociis natoque penatibus et
                        magnis dis parturient montes. Ridiculus mus mauris vitae
                        ultricies leo. Neque egestas congue quisque egestas
                        diam. Risus in hendrerit gravida rutrum quisque non.
                    </p>
                </div>

                <div className="xl:px-10 py-10 flex flex-col gap-5">
                    <h1 className="text-[36px]/[48px] font-[600] text-[#0955AC]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod.
                    </h1>
                    <p className="text-[16px]/[28px] text-[#6D6E76]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Non blandit massa enim nec. Scelerisque
                        viverra mauris in aliquam sem. At risus viverra
                        adipiscing at in tellus. Sociis natoque penatibus et
                        magnis dis parturient montes. Ridiculus mus mauris vitae
                        ultricies leo. Neque egestas congue quisque egestas
                        diam. Risus in hendrerit gravida rutrum quisque non.
                    </p>
                    <p className="text-[16px]/[28px] text-[#6D6E76]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Non blandit massa enim nec. Scelerisque
                        viverra mauris in aliquam sem. At risus viverra
                        adipiscing at in tellus. Sociis natoque penatibus et
                        magnis dis parturient montes. Ridiculus mus mauris vitae
                        ultricies leo. Neque egestas congue quisque egestas
                        diam. Risus in hendrerit gravida rutrum quisque non.
                    </p>
                    <div className="flex flex-col font-[500] md:text-[24px]/[32px] text-[#0955AC]">
                        <li>Lorem ipsum dolor sit amet</li>
                        <li>Non blandit massa enim nec scelerisque</li>
                        <li>Neque egestas congue quisque egestas</li>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
