import React from 'react'
import SideMenu from '../../components/vendors/SideMenu';
import UnitContent from '../../components/vendors/units/UnitContent';

const Unit = () => {
  return (
    <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <UnitContent/>
            </div>
        </div>
  )
}

export default Unit;