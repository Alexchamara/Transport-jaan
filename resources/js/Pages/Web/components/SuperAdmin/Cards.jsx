import React from 'react'
import view from '../../assets/superAdmin/Views Icon.png'
import dotsThreeIcon from '../../assets/superAdmin/Dots Three Icon.png'
import users from '../../assets/superAdmin/Users Icon.png'
import externalR from '../../assets/superAdmin/Arrow External Right.png'
import externalR2 from '../../assets/superAdmin/Arrow External Right.png'
import addition from '../../assets/superAdmin/Signups Icon.png'
import features from '../../assets/superAdmin/Features Icon.png'

const Cards = ({ userStats }) => {
    const stats = userStats || {
        monthlyUsers: 0,
        monthlyGrowth: 0,
        newSignups: 0,
        signupGrowth: 0,
        totalUsers: 0,
        isMonthlyGrowthPositive: true,
        isSignupGrowthPositive: true,
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-12 my-[50px]">
            <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                <div className="flex flex-row items-center gap-2">
                    <img src={view} className="size-[14px]" alt="view icon" />
                    <h1 className="text-[#AEB9E1] text-[12px]">Pageviews</h1>
                    <img src={dotsThreeIcon} className="size-[16px] ml-auto" alt="more options" />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <h1 className="text-white text-[32px] font-bold">50.8K</h1>
                    <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px]">
                        <h1 className="flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">28.4%</h1>
                        <img src={externalR} className="size-[9px] md:w-[10px]" alt="external link" />
                    </div>
                </div>
            </div>

            <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                <div className="flex flex-row items-center gap-2">
                    <img src={users} className="size-[14px]" alt="users icon" />
                    <h1 className="text-[#AEB9E1] text-[12px]">Monthly users</h1>
                    <img src={dotsThreeIcon} className="size-[16px] ml-auto" alt="more options" />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <h1 className="text-white text-[32px] font-bold">{formatNumber(stats.monthlyUsers)}</h1>
                    <div className={'w-[50px] h-[20px] flex justify-center items-center border rounded-[5px] ' + (stats.isMonthlyGrowthPositive ? 'border-[#05C16833] bg-[#05C16833]' : 'border-[#FF5A6533] bg-[#FF5A6533]')}>
                        <h1 className={'flex items-baseline text-[9px] px-1 text-[14px] font-medium ' + (stats.isMonthlyGrowthPositive ? 'text-green-400' : 'text-[#FF5A65]')}>{Math.abs(stats.monthlyGrowth)}%</h1>
                        <img src={stats.isMonthlyGrowthPositive ? externalR : externalR2} className="size-[9px] md:w-[10px]" alt="trend" />
                    </div>
                </div>
            </div>

            <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                <div className="flex flex-row items-center gap-2">
                    <img src={addition} className="size-[14px]" alt="signup icon" />
                    <h1 className="text-[#AEB9E1] text-[12px]">New signups</h1>
                    <img src={dotsThreeIcon} className="size-[16px] ml-auto" alt="more options" />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <h1 className="text-white text-[32px] font-bold">{stats.newSignups}</h1>
                    <div className={'w-[50px] h-[20px] flex justify-center items-center border rounded-[5px] ' + (stats.isSignupGrowthPositive ? 'border-[#05C16833] bg-[#05C16833]' : 'border-[#FF5A6533] bg-[#FF5A6533]')}>
                        <h1 className={'flex items-baseline text-[9px] px-1 text-[14px] font-medium ' + (stats.isSignupGrowthPositive ? 'text-green-400' : 'text-[#FF5A65]')}>{Math.abs(stats.signupGrowth)}%</h1>
                        <img src={stats.isSignupGrowthPositive ? externalR : externalR2} className="size-[9px] md:w-[10px]" alt="trend" />
                    </div>
                </div>
            </div>

            <div className="w-[249px] h-[100px] flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] pt-4 pl-4 pr-4 relative">
                <div className="flex flex-row items-center gap-2">
                    <img src={features} className="size-[14px]" alt="total icon" />
                    <h1 className="text-[#AEB9E1] text-[12px]">Total Users</h1>
                    <img src={dotsThreeIcon} className="size-[16px] ml-auto" alt="more options" />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <h1 className="text-white text-[32px] font-bold">{formatNumber(stats.totalUsers)}</h1>
                    <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px]">
                        <h1 className="flex items-baseline text-green-400 text-[9px] px-1 text-[14px] font-medium">100%</h1>
                        <img src={externalR} className="size-[9px] md:w-[10px]" alt="external link" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cards
