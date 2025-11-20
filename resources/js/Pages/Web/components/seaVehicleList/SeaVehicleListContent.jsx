import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";

// spec icons (same ones you already use)
import meter from "../../assets/rentAVehicle/collection/meter.png";
import gearBox from "../../assets/rentAVehicle/collection/gearbox.png";
import user from "../../assets/rentAVehicle/collection/user.png";
import gas from "../../assets/rentAVehicle/collection/gas.png";
import heartFill from "../../assets/rentAVehicle/collection/heartFill.png";
import heart from "../../assets/rentAVehicle/collection/heart.png";

const SeaVehicleListContent = ({ vehicles: initialVehicles, authUser, likedVehicleIds }) => {
  
  // normalize input (paginator or array)
  const vehicles = useMemo(
    () => (Array.isArray(initialVehicles) ? initialVehicles : (initialVehicles?.data || [])),
    [initialVehicles]
  );

  // liked map for O(1) checks
  const [likedMap, setLikedMap] = useState({});
  useEffect(() => {
    const m = {};
    (likedVehicleIds || []).forEach((id) => (m[id] = true));
    setLikedMap(m);
  }, [likedVehicleIds]);

  // helper: best image URL
  const getImg = (v) => {
    if (v?.primary_image_url) return v.primary_image_url;
    if (Array.isArray(v?.images) && v.images.length) {
      if (v.images[0].url) return v.images[0].url;
      if (v.images[0].image_path) return `/storage/${v.images[0].image_path}`;
      if (v.images[0].path) return `/storage/${v.images[0].path}`;
    }
    if (v?.primaryImage?.path) return `/storage/${v.primaryImage.path}`;
    return "/placeholder.png";
  };

 const toggleLike = async (vehicleId) => {
  if (!authUser) {
    alert("You must be logged in to like a vehicle.");
    router.visit("/signin");
    return;
  }
  const next = !likedMap[vehicleId];
  setLikedMap((prev) => ({ ...prev, [vehicleId]: next }));                                
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  try {
    const { data } = await axios.post(
      route("client.vehicle.like.toggle"),
      { vehicle_id: vehicleId },
      { headers: { 'X-CSRF-TOKEN': token } }  // <-- include CSRF token here
    );

    const map = {};
    (data.likedVehicleIds || []).forEach((id) => (map[id] = true));
    setLikedMap(map);
  } catch (e) {
    console.error(e);
    alert("Something went wrong while liking the vehicle.");
  }
};


  const view = (id) => {
    const search = window.location.search || "";
    router.visit(`/seaVehicleDetails/${id}${search}`);
  };

  return (
    <div className="w-full py-6 md:py-12 px-4 md:px-40">
      <div className="container mx-auto">
        <p className="bebas-neue text-[28px] md:text-[40px] font-[400] mb-8">
          we found <span className="text-[#0955AC]">{vehicles.length} Boat</span> for you
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-15 justify-items-center">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-[#EAEAE9] shadow-md overflow-hidden h-auto w-full max-w-[286px] py-5"
            >
              {/* --- top spec row --- */}
              <div className="pb-4">
                <div className="grid grid-cols-4 gap-4 text-[#8B8B8B]">
                  {[
                    { icon: meter, label: v.mileage_km ?? "-" },
                    { icon: gearBox, label: v?.landSpec?.transmission_type || "-" },
                    { icon: user, label: v?.landSpec?.seats || v.passenger_capacity || "-" },
                    { icon: gas, label: v?.landSpec?.fuel_type || "-" },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <img src={s.icon} alt="" className="w-5 h-5 opacity-60" />
                      <span className="text-[11px] leading-none">{String(s.label)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- vehicle image --- */}
              <div className="mx-auto w-[90%] mb-4">
                <div className="relative h-[180px] sm:h-[210px] md:h-[240px] rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gray-100">
                  <img
                    src={getImg(v)}
                    alt={v.model || "vehicle"}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      // e.currentTarget.src = placeholderImg; // optional fallback
                    }}
                  />
                </div>
              </div>

              {/* --- title + price --- */}
              <div className="text-center">
                <h3 className="bebas-neue text-[30px] tracking-wide">
                  {(v.model || "").toUpperCase()}
                </h3>
                <div className="flex items-end justify-center gap-2">
                  <div className="font-extrabold text-[28px] md:text-[32px]">
                    {(Number(v.rental_price_per_day) || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-[#585858] text-sm pb-1">/day</div>
                </div>

                {/* --- button row --- */}
                <div className="mt-5 flex items-center gap-3 px-4">
                  <button
                    onClick={() => view(v.id)}
                    className="flex-1 h-[42px] rounded bg-[#0955AC] text-white text-[11px] font-[700] tracking-wider"
                  >
                    VIEW DETAILS
                  </button>

                  <button
                    onClick={() => toggleLike(v.id)}
                    className="h-[42px] w-[42px] rounded border border-[#0955AC] grid place-items-center bg-white"
                    aria-label={likedMap[v.id] ? 'Unlike' : 'Like'}
                  >
                    <img
                      src={likedMap[v.id] ? heartFill : heart}
                      alt=""
                      className="w-[18px] h-[18px]"
                    />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default SeaVehicleListContent;
