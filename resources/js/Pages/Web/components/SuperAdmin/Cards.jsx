import React from 'react'
import view from '../../assets/superAdmin/Views Icon.png'
import dotsThreeIcon from '../../assets/superAdmin/Dots Three Icon.png'
import users from '../../assets/superAdmin/Users Icon.png'
import externalR from '../../assets/superAdmin/Arrow External Right.png'
import externalR2 from '../../assets/superAdmin/Arrow External Right.png'
import addition from '../../assets/superAdmin/Signups Icon.png'
import features from '../../assets/superAdmin/Features Icon.png'

const Cards = () => {
  return (
    <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-12 my-[50px]">
                {/* Card 1 */}
                <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src={view}
                            className="size-[14px]"
                            alt="view icon"
                        />
                        <h1 className="text-[#AEB9E1] text-[12px]">
                            Pageviews
                        </h1>
                        <img
                            src={dotsThreeIcon}
                            className="size-[16px] ml-auto"
                            alt="more options"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-white text-[32px] font-bold">
                            50.8K
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
                            <h1 className=" flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">
                                28.4%
                            </h1>
                            <img
                                src={externalR}
                                className="size-[9px] md:w-[10px]"
                                alt="external link"
                            />
                        </div>
                    </div>
                </div>
                {/* Card 2 */}
                <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src={users}
                            className="size-[14px]"
                            alt="view icon"
                        />
                        <h1 className="text-[#AEB9E1] text-[12px]">
                            Monthly users
                        </h1>
                        <img
                            src={dotsThreeIcon}
                            className="size-[16px] ml-auto"
                            alt="more options"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-white text-[32px] font-bold">
                            23.6K
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#FF5A6533] bg-[#FF5A6533] rounded-[5px] ">
                            <h1 className=" flex items-baseline text-[#FF5A65] text-[9px] px-1 text-[14px] font-medium">
                                28.4%
                            </h1>
                            <img
                                src={externalR2}
                                className="size-[9px] md:w-[10px]"
                                alt="external link"
                            />
                        </div>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src={addition}
                            className="size-[14px]"
                            alt="view icon"
                        />
                        <h1 className="text-[#AEB9E1] text-[12px]">
                            New signups
                        </h1>
                        <img
                            src={dotsThreeIcon}
                            className="size-[16px] ml-auto"
                            alt="more options"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-white text-[32px] font-bold">
                            756
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
                            <h1 className=" flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">
                                3.1%
                            </h1>
                            <img
                                src={externalR}
                                className="size-[9px] md:w-[10px]"
                                alt="external link"
                            />
                        </div>
                    </div>
                </div>
                {/* Card 4 */}
                <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                    <div className="flex flex-row items-center gap-2">
                        <img
                            src={features}
                            className="size-[14px]"
                            alt="view icon"
                        />
                        <h1 className="text-[#AEB9E1] text-[12px]">
                            Subcriptions
                        </h1>
                        <img
                            src={dotsThreeIcon}
                            className="size-[16px] ml-auto"
                            alt="more options"
                        />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <h1 className="text-white text-[32px] font-bold">
                            2.3K
                        </h1>
                        <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
                            <h1 className=" flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">
                                11.3%
                            </h1>
                            <img
                                src={externalR}
                                className="size-[9px] md:w-[10px]"
                                alt="external link"
                            />
                        </div>
                    </div>
                </div>
            </div>
  )
}

export default Cards;
