import React from 'react'
import Propic from '../../../../../Pages/Web/assets/vendors/profile/Profill.svg'
import Start from '../../../../../Pages/Web/assets/vendors/profile/ic-actions-star.svg'

const InformationCard = ({ vendor, vendorProfile, stats }) => {
    const vendorName = vendor?.name || 'Unknown Vendor';
    const companyName = vendorProfile?.company_name || vendor?.name || 'Company Name';
    const about = vendorProfile?.description || 'No description available for this vendor.';
    const rating = stats?.avgRating || 0;
    const totalReviews = stats?.totalReviews || 0;
    const monthsSinceJoined = stats?.monthsSinceJoined || 0;
    const daysSinceJoined = stats?.daysSinceJoined || 0;
    
    // Display logic: if less than 1 month, show days instead
    const joinedText = monthsSinceJoined >= 1 
        ? `Joined ${monthsSinceJoined} ${monthsSinceJoined === 1 ? 'month' : 'months'} ago`
        : `Joined ${daysSinceJoined} ${daysSinceJoined === 1 ? 'day' : 'days'} ago`;
    
    return (
        <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10'>
            <div className='bg-[#D9D9D9] rounded-[16px] sm:rounded-[20px] px-4 sm:px-8 lg:px-14 py-6 sm:py-8 lg:py-10'>
                <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center'>
                    <img src={Propic} alt="Profile" className='w-[88px] h-[88px] sm:w-[110px] sm:h-[110px]' />
                    <div className='flex flex-col gap-2'>
                        <div className='poppins font-bold text-[28px] sm:text-[36px] lg:text-[45px] leading-tight'>{companyName}</div>
                        <div className='flex flex-wrap gap-2 sm:gap-3 items-center'>
                            <img className='w-[24px] h-[24px] sm:w-[32px] sm:h-[32px]' src={Start} alt="Star" />
                            <div className='poppins text-[20px] sm:text-[26px] lg:text-[32px]'>{rating.toFixed(1)}</div>
                            <div className='poppins text-[18px] sm:text-[22px] lg:text-[30px] text-[#949699]'>({totalReviews} Reviews)</div>
                        </div>
                        <div className='poppins text-[16px] sm:text-[20px] lg:text-[24px] text-[#949699]'>
                            {joinedText}
                        </div>
                    </div>

                    <div className='poppins flex flex-col max-w-[680px]'>
                        <div className='text-[18px] sm:text-[20px] font-bold'>About</div>
                        <div className='text-[14px] sm:text-[16px] lg:text-[18px] leading-6 sm:leading-7'>
                            {about}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InformationCard