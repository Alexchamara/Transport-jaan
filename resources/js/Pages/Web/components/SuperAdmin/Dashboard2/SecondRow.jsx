import React from 'react'
import Service from '../../SuperAdmin/Dashboard2/Service';
import TeamProgress from './TeamProgress';
import TransactionsChart from './TransactionsChart';

const SecondRow = () => {
  return (
    <div className='w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[18px]'>
      <div className='w-full h-[264px] text-white bg-[#0B1739] rounded-[10px]'>
        <Service />
      </div>
      <div className='w-full h-[264px] text-white bg-[#0B1739] rounded-[10px]'>
        <TeamProgress />
      </div>
      <div className='w-full h-[264px] text-white bg-[#0B1739] rounded-[10px]'>
        <TransactionsChart />
      </div>
    </div>
  )
}

export default SecondRow