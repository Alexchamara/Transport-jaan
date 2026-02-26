import React from "react";
import { usePage } from "@inertiajs/react";
import VendorLayout from "./VendorLayout";
import UnitContent from "../../components/vendors/units/UnitContent";

const Unit = () => {
  const { units, filters, perPage, perPageOptions } = usePage().props;

  return (
    <VendorLayout activeService="Vehicle Rental">
      <UnitContent
        units={units}
        initialFilters={filters}
        initialPerPage={perPage}
        perPageOptions={perPageOptions}
      />
    </VendorLayout>
  );
};

export default Unit;
