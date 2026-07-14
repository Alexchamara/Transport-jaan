// resources/js/Pages/Web/home/land/components/PoliciesTab.jsx
import React from "react";
import { usePage } from "@inertiajs/react";

const PoliciesTab = ({ policyUrl: propPolicy }) => {
  const { vehicle } = usePage().props || {};
  const policyUrl = propPolicy ?? vehicle?.policy_stream_url ?? null;

  if (!policyUrl) {
    return (
      <div className="p-0">
        <h2 className="text-[20px] font-[600] mb-3">Policy</h2>
        <p className="text-sm text-white">
          No policy document has been uploaded for this vehicle yet.
        </p>
      </div>
    );
  }

  // Hide viewer chrome and fit page width
  const hash = "toolbar=0&navpanes=0&scrollbar=0&zoom=page-width&view=FitH&pagemode=none";

  // A4 portrait ~96dpi (210mm × 297mm ≈ 794 × 1123 px)
  const A4_WIDTH_PX = 794;
  const A4_RATIO = "210 / 297"; // use "297 / 210" for landscape

  return (
    <div className="p-0">
      {/* Force a white page background everywhere around the PDF */}
      <style>{`
        html, body, #app, #root {
          background: #fff !important;
        }
        /* keep the embed area white even if the browser tries dark UI */
        .pdf-host,
        .pdf-host embed[type="application/pdf"],
        .pdf-host object[type="application/pdf"],
        .pdf-host iframe {
          background: #fff !important;
          color-scheme: light;
        }
      `}</style>

      {/* A4 canvas (no outer margins/padding) */}
      <div
        className="pdf-host relative mx-auto w-full"
        style={{
          maxWidth: `${A4_WIDTH_PX}px`,
          aspectRatio: A4_RATIO,
        }}
      >
        <embed
          src={`${policyUrl}#${hash}`}
          type="application/pdf"
          className="absolute inset-0 w-full h-full border-0 outline-none"
          style={{ backgroundColor: "#fff" }}
        />
      </div>
    </div>
  );
};

export default PoliciesTab;
