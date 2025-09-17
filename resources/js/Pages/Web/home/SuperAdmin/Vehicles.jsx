import React from 'react'
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import RightSide from '../../components/SuperAdmin/Vehicles/RightSide';

const Vehicles = () => {
  return (
    <div className="flex flex-row bg-[#081028] h-full sm:flex-col md:flex-row lg:flex-row poppins pb-10">
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>
            <div className="sm:w-full md:w-auto lg:w-auto">
                <RightSide />
            </div>
        </div>
  )
}

export default Vehicles;
