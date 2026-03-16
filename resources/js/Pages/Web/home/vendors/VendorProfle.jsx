import React from 'react'
import Header from '../../layouts/Header'
import BackButton from "../../components/BackBtn";
import Btns from '../../components/vendors/profile/Btns';
import InformationCard from '../../components/vendors/profile/informationCard';

const VendorProfile = () => {
    return (
        <div className='min-h-screen'>
            <Header />
            <div className='flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center px-4 sm:px-6 xl:px-10 py-4 sm:py-6'>
                <div>
                    <BackButton />
                </div>
                <div className='figtree font-bold text-[26px] sm:text-[30px] lg:text-[35px] leading-tight'>
                    Profile Information
                </div>
            </div>
            <InformationCard />
            <Btns />

        </div>
    )
}

export default VendorProfile