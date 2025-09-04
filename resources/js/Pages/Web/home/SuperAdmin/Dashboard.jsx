import React from 'react'
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';
import RightSide from '../../components/SuperAdmin/Dashboard1/RightSide';

const Dashboard = ({ userStats }) => {

  useEffect(() => {
    // Check if this is the first load after login
    const isFirstLoad = localStorage.getItem('adminDashboardLoaded') !== 'true';

    if (isFirstLoad) {
      // Set the flag to indicate the dashboard has been loaded
      localStorage.setItem('adminDashboardLoaded', 'true');

      // Refresh the page once
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to ensure the page is fully rendered first
    }
    // Clear the flag when the component is unmounted (user navigates away)
    return () => {
      // Don't clear the flag here so it persists during the refresh
    };
  }, []);
  return (
    <div className='flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins'>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <SideMenu />
      </div>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <RightSide />
      </div>
    </div>
  )
}

export default Dashboard
