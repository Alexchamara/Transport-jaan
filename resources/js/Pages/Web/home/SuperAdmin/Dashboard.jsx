import React from 'react'
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';
import RightSide from '../../components/SuperAdmin/Dashboard1/RightSide';

const Dashboard = ({ userStats }) => {
  // Removed the auto-refresh logic that was causing large header issues
  // with nginx by triggering multiple page reloads

  return (
    <div className='flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins'>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <SideMenu />
      </div>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <RightSide userStats={userStats} />
      </div>
    </div>
  )
}

export default Dashboard;

