import React from "react";

// Land icons (you already have these)
import miles from "../../../assets/landVehicleDetails/carSpec/miles.svg";
import fuel from "../../../assets/landVehicleDetails/carSpec/fuel.svg";
import gear from "../../../assets/landVehicleDetails/carSpec/gear.svg";
import seats from "../../../assets/landVehicleDetails/carSpec/seats.svg";
import model from "../../../assets/landVehicleDetails/carSpec/model.svg";
import doors from "../../../assets/landVehicleDetails/carSpec/doors.svg";
import airBag from "../../../assets/landVehicleDetails/carSpec/airBag.svg";
import liters from "../../../assets/landVehicleDetails/carSpec/liters.svg";

/** Small tile */
const SpecTile = ({ icon, label, value }) => {
  return (
    <div className="w-[187px] h-[81px] border border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-3 px-4 py-4">
      {icon ? <img src={icon} alt={label} className="shrink-0" /> : null}
      <div className="flex flex-col items-start leading-4">
        <span className="text-[10px] font-[600] opacity-60">{label}</span>
        <span className="text-[12px] font-[800]">{value || "—"}</span>
      </div>
    </div>
  );
};

/** Helpers */
const fmtNumber = (n) =>
  (n || n === 0) && !isNaN(n) ? new Intl.NumberFormat().format(Number(n)) : undefined;
const cap = (s) => (typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : undefined);

const Row = ({ children }) => (
  <div className="flex flex-col xl:flex-row gap-10 justify-center items-center">
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <div className="py-10">
    <h1 className="text-[15px] font-[600]">{title}</h1>
    <div className="py-10 text-[12px] font-[700]">
      <div className="flex flex-col justify-center items-center gap-10">{children}</div>
    </div>
  </div>
);

const CarDetailsTab = ({ vehicle }) => {
  const v = vehicle ?? {};
  const category = String(v.category || "").toLowerCase(); // "land" | "air" | "sea"

  /* ---------- Description ---------- */
  const description =
    v.description && v.description.trim().length > 0
      ? v.description
      : "No description provided for this unit.";

  /* ---------- LAND SPECS ---------- */
  const landTiles = [
    { icon: miles, label: "Mileage", value: fmtNumber(v.mileage) },
    { icon: fuel, label: "Fuel", value: cap(v.fuelType) },
    { icon: gear, label: "Transmission", value: cap(v.transmissionType) },
    { icon: seats, label: "Seats", value: v.seats ? `${v.seats}` : undefined },
    { icon: airBag, label: "Airbags", value: v.airbags ? `${v.airbags}` : undefined },
    {
      icon: model,
      label: "Brand / Model",
      value: [v.manufacture, v.model].filter(Boolean).join(" • ") || undefined,
    },
    { icon: doors, label: "Doors", value: v.doors ? `${v.doors}` : undefined },
    { icon: liters, label: "Fuel Tank", value: v.fuelTankCapacity ? `${v.fuelTankCapacity} L` : undefined },
  ];

  /* ---------- AIR SPECS ---------- */
  const airTiles = [
    { label: "Aircraft Type", value: cap(v.aircraft_type) },
    { label: "ICAO Type", value: v.icao_type_designator },
    { label: "Base IATA", value: v.base_airport_iata },
    { label: "Base ICAO", value: v.base_airport_icao },
    { label: "Seats", value: v.seats ? `${v.seats}` : undefined },
    { label: "Crew Required", value: v.crew_required ? `${v.crew_required}` : undefined },
    { label: "Range", value: v.range_km ? `${fmtNumber(v.range_km)} km` : undefined },
    { label: "MTOW", value: v.mtow_kg ? `${fmtNumber(v.mtow_kg)} kg` : undefined },
  ];

  /* ---------- SEA SPECS ---------- */
  const seaTiles = [
    { label: "Vessel Type", value: cap(v.vessel_type) },
    { label: "Hull Material", value: v.hull_material },
    { label: "Length", value: v.length_m ? `${v.length_m} m` : undefined },
    { label: "Beam", value: v.beam_m ? `${v.beam_m} m` : undefined },
    { label: "Draft", value: v.draft_m ? `${v.draft_m} m` : undefined },
    { label: "Engine Type", value: cap(v.engine_type) },
    { label: "Engine Power", value: v.engine_power_hp ? `${fmtNumber(v.engine_power_hp)} hp` : undefined },
    { label: "Fuel", value: cap(v.sea_fuel_type) },
  ];

  const rows = (tiles, useIcons = false) => [
    <Row key="row1">
      {tiles.slice(0, 4).map((t, i) => (
        <SpecTile key={i} icon={useIcons ? t.icon : null} label={t.label} value={t.value} />
      ))}
    </Row>,
    <Row key="row2">
      {tiles.slice(4, 8).map((t, i) => (
        <SpecTile key={i} icon={useIcons ? t.icon : null} label={t.label} value={t.value} />
      ))}
    </Row>,
  ];

  return (
    <>
      {/* Description */}
      <div className="flex flex-col gap-5">
        <h1 className="text-[15px] font-[600]">Description</h1>
        <p className="text-[14px]/[33px] font-[400] text-justify px-5">{description}</p>
      </div>

      {/* Category-specific specs */}
      {category === "land" && (
        <Section title="Car Specifications">{rows(landTiles, true)}</Section>
      )}

      {category === "air" && (
        <Section title="Aircraft Specifications">{rows(airTiles)}</Section>
      )}

      {category === "sea" && (
        <Section title="Vessel Specifications">{rows(seaTiles)}</Section>
      )}
    </>
  );
};

export default CarDetailsTab;
