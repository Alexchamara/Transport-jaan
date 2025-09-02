import React from "react";
import { Head, usePage } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu.jsx";
import UnitDetailsContent from "../../components/vendors/units/UnitDetailsContent.jsx";

const UnitDetails = () => {
  const page = usePage();
  const vehicle = page?.props?.vehicle ?? null;

  const title =
    (vehicle?.manufacture ? `${vehicle.manufacture} ` : "") +
    (vehicle?.model ?? "");

  return (
    <div className="bg-[#E5E5E5] min-h-screen">
      <Head title={title ? `${title} — Details` : "Unit Details"} />
      <div className="flex flex-row gap-10">
        <SideMenu />
        <div className="flex-1">
          {!vehicle ? (
            <div className="p-6 text-sm text-black/60">Loading unit…</div>
          ) : (
            <UnitDetailsContent
              vehicle={vehicle}
              vehicleId={vehicle?.id}
              policyPdfUrl={vehicle?.policy_pdf_url ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitDetails;
