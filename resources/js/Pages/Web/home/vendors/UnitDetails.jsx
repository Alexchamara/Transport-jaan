// resources/js/Pages/Web/home/vendors/UnitDetails.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu.jsx";
import UnitDetailsContent from "../../components/vendors/units/UnitDetailsContent.jsx";

const UnitDetails = () => {
  const page = usePage();
  const vehicle = page?.props?.vehicle ?? null;

  return (
    <div className="bg-[#E5E5E5] h-auto">
      <div className="flex flex-row gap-10 h-auto">
        <SideMenu />
        <UnitDetailsContent
          vehicle={vehicle}
          vehicleId={vehicle?.id}
          policyPdfUrl={vehicle?.policy_pdf_url ?? null}
        />
      </div>
    </div>
  );
};

export default UnitDetails;
