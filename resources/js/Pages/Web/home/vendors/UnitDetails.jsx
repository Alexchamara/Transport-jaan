import React from "react";
import { Head, usePage } from "@inertiajs/react";
import VendorShellLayout from "../../../../Components/vendors/VendorShellLayout";
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
      <VendorShellLayout activeService="Vehicle Rental">
        {!vehicle ? (
          <div className="p-6 text-sm text-black/60">Loading unit…</div>
        ) : (
          <UnitDetailsContent
            vehicle={vehicle}
            vehicleId={vehicle?.id}
            policyPdfUrl={vehicle?.policy_pdf_url ?? null}
          />
        )}
      </VendorShellLayout>
    </div>
  );
};

export default UnitDetails;
