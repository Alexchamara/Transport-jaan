import React, { useMemo, useState } from "react";
import { usePage, router } from "@inertiajs/react";

import shareIcon from "../../assets/landVehicleDetails/share.svg";
import starIcon from "../../assets/driverBooking/star.svg";
import heartWhite from "../../assets/landVehicleDetails/heartB2.svg";

import PlaneDetailsTab from "./PlaneDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

const PlaneInfo = () => {
  const { props } = usePage();
  const vehicle = props?.vehicle;

  // ✅ Active if the vehicle exists in vehicle_likes (through shared likedVehicleIds) or server-injected is_liked
  const initialIsLiked = useMemo(() => {
    if (!vehicle) return false;
    if (typeof vehicle.is_liked === "boolean") return vehicle.is_liked;
    const likedIds = props?.likedVehicleIds || [];
    return Array.isArray(likedIds) ? likedIds.includes(vehicle.id) : false;
  }, [props, vehicle]);

  const [selectedTab, setSelectedTab] = useState("plane-details");
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [busy, setBusy] = useState(false);

  const titleBrand = vehicle?.manufacturer || "—";
  const titleModel = vehicle?.model || vehicle?.name || "—";
  const titleYear = vehicle?.manufacture_year || vehicle?.registration_year || "";
  const isAvailable = (vehicle?.status || "").toLowerCase() === "active";
  const rating = vehicle?.rating_avg ? Number(vehicle.rating_avg).toFixed(1) : null;
  const reviewsCount = vehicle?.reviews_count ?? (Array.isArray(vehicle?.reviews) ? vehicle.reviews.length : 0);

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${titleBrand} ${titleModel}`,
          text: "Check out this vehicle",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      }
    } catch(_) {}
  };

const onToggleWishlist = async () => {
  if (!vehicle?.id) return;

  if (!props?.auth?.user) {
    router.visit(route?.("login") ?? "/login");
    return;
  }

  const next = !isLiked;
  setIsLiked(next);
  setBusy(true);

  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    await axios.post(
      route("client.vehicle.like.toggle"),
      { vehicle_id: vehicle.id },
      { headers: { "X-CSRF-TOKEN": token } }
    );

    // No need for setLikedMap
  } catch (err) {
    setIsLiked(!next); // revert if error
    console.error(err);
    alert("Something went wrong");
  } finally {
    setBusy(false);
  }
};



  if (!vehicle) {
    return (
      <div className="poppins w-full h-auto">
        <p className="text-sm text-gray-500">No vehicle data.</p>
      </div>
    );
  }

  return (
    <div className="poppins w-full h-auto">
      {/* Brand crumb */}
      <h1 className="text-[12px] font-[600] text-[#00000080]">{titleBrand}</h1>

      {/* Title row */}
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex flex-col md:flex-row gap-5">
          <h1 className="bebas-neue text-[30px]">
            {titleBrand} <span className="text-[#0955AC]">{titleModel}</span>{" "}
            {titleYear ? `(${titleYear})` : ""}
          </h1>

          <div className="flex flex-row items-center gap-2">
            <div className={`w-[10px] h-[10px] rounded-full ${isAvailable ? "bg-[#3C9A34]" : "bg-[#d14343]"}`} />
            <h1 className={`${isAvailable ? "text-[#3C9A34]" : "text-[#d14343]"} text-[10px]`}>
              {isAvailable ? "Available" : "Unavailable"}
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-5">
          <button
            type="button"
            onClick={onShare}
            className="w-[81px] h-[30px] rounded-[4px] border-[1px] border-[#00000030] bg-[#EAE9E8] flex flex-row justify-center items-center gap-3"
          >
            <img src={shareIcon} alt="share" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={onToggleWishlist}
            disabled={busy}
            className={`w-[110px] h-[30px] rounded-[4px] border-[1px] flex flex-row justify-center items-center gap-3 ${
              isLiked ? "border-[#0955AC] bg-[#0955AC] text-white" : "border-[#00000030] bg-white text-[#0955AC]"
            } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <img src={heartWhite} alt="wishlist" />
            <span>{isLiked ? "Wishlisted" : "Wishlist"}</span>
          </button>
        </div>
      </div>

      {/* Rating row */}
      <div className="flex flex-row gap-5 text-[12px] font-[600] items-center">
        <img src={starIcon} alt="rating" />
        <h1>{rating ?? "—"}</h1>
        <h1 className="underline">
          {reviewsCount ? `${reviewsCount} Reviews` : "No Reviews"}
        </h1>
      </div>

      {/* Tabs */}
      <div className="py-10">
        <div className="flex flex-col md:flex-row md:gap-20 px-20 text-[12px] font-[600] text-[#00000080] border-b-[2px] border-[#0000001F]">
          {[
            { key: "plane-details", label: "Plane Details" },
            { key: "policies", label: "Policies" },
            { key: "reviews", label: "Reviews" },
            { key: "gallery", label: "Image Gallery" },
          ].map((tab) => (
            <h1
              key={tab.key}
              className={`border-b-[2px] pb-5 w-[120px] flex justify-center items-center cursor-pointer ${
                selectedTab === tab.key ? "border-[#0955AC] text-[#0955AC]" : ""
              }`}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.label}
            </h1>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {selectedTab === "plane-details" && <PlaneDetailsTab vehicle={vehicle} />}
      {selectedTab === "policies" && <PoliciesTab vehicle={vehicle} />}
      {selectedTab === "reviews" && <ReviewsTab vehicle={vehicle} />}
      {selectedTab === "gallery" && <GalleryTab vehicle={vehicle} />}
    </div>
  );
};

export default PlaneInfo;
