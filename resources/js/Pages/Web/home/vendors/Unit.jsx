// resources/js/Pages/vendors/units/Unit.jsx
import React from "react";
import SideMenu from "../../components/vendors/SideMenu";
import UnitContent from "../../components/vendors/units/UnitContent";
import { usePage } from "@inertiajs/react";

const Unit = () => {
  const { units, filters, perPage, perPageOptions } = usePage().props;

  return (
    <div className="bg-[#E5E5E5] h-auto">
      <div className="flex flex-row gap-10 h-auto">
        <SideMenu />
        <UnitContent
          units={units}
          initialFilters={filters}
          initialPerPage={perPage}
          perPageOptions={perPageOptions}
        />
      </div>
    </div>
  );
};

export default Unit;
