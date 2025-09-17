import React from 'react'
import Service from '../../SuperAdmin/Dashboard2/Service';  
import TeamProgress from './TeamProgress';
import TransactionsChart from './TransactionsChart';  

const SecondRow = () => {
  return (
    <div className='w-[1125px] flex flex-row justify-center gap-[18px]'>
      <div className='min-w-[341px] h-[264px] text-white bg-[#0B1739] rounded-[10px]'>
        <Service />
      </div>
      <div className='min-w-[318px] h-[264px] text-white bg-[#0B1739] rounded-[10px]'>
        <TeamProgress />
      </div>
      <div className='min-w-[341px] h-[264px] text-white bg-[#0B1739] rounded-[10px]'>
        <TransactionsChart />
      </div>
    </div>
  )
}

export default SecondRow