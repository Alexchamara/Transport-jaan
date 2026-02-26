import React, { useMemo, useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import { Heart } from "lucide-react";

import shareIcon from "../../assets/landVehicleDetails/share.svg";
import starIcon from "../../assets/driverBooking/star.svg";

import WarehouseDetailsTab from "./WarehouseDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

const WarehouseInfo = () => {
  const { props } = usePage();
  const warehouse = props?.warehouse;

  // ✅ Active if the warehouse exists in warehouse_likes (through shared likedWarehouseIds) or server-injected is_liked
  const initialIsLiked = useMemo(() => {
    if (!warehouse) return false;
    if (typeof warehouse.is_liked === "boolean") return warehouse.is_liked;
    const likedIds = props?.likedWarehouseIds || [];
    return Array.isArray(likedIds) ? likedIds.includes(warehouse.id) : false;
  }, [props, warehouse]);

  const [selectedTab, setSelectedTab] = useState("warehouse-details");
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [busy, setBusy] = useState(false);

  // Keep local isLiked in sync if server-side props change (e.g., after partial reloads)
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const titleName = warehouse?.name || "—";
  const titleType = warehouse?.type || warehouse?.warehouse_type || "";
  const titleLocation = warehouse?.city || warehouse?.location || "";
  const isAvailable = (warehouse?.status || "").toLowerCase() === "available" || (warehouse?.status || "").toLowerCase() === "active";
  const rating = warehouse?.rating_avg ? Number(warehouse.rating_avg).toFixed(1) : null;
  const reviewsCount = warehouse?.reviews_count ?? (Array.isArray(warehouse?.reviews) ? warehouse.reviews.length : 0);

  const resolveWishlistUrl = () => {
    if (typeof route === "function") {
      try {
        return route("client.warehouse.like.toggle");
      } catch (error) {
        console.warn("Falling back to hardcoded wishlist URL", error);
      }
    }

  return "/api/warehouse/like-toggle";
  };

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${titleName}`,
          text: "Check out this warehouse facility",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      }
    } catch(_) {}
  };

  const onToggleWishlist = async () => {
    if (!warehouse?.id) return;

    // 🔐 Auth guard
    if (!props?.auth?.user) {
      router.get(route?.("signin") ?? "/signin", { return_to: window.location.pathname });
      return;
    }

    // ⭐ Optimistic UI
    const next = !isLiked;
    setIsLiked(next);
    setBusy(true);

    try {
      const { data } = await axios.post(resolveWishlistUrl(), { warehouse_id: warehouse.id });

      if (Array.isArray(data.likedWarehouseIds)) {
        setIsLiked(data.likedWarehouseIds.includes(warehouse.id));
      } else if (typeof data.is_liked === "boolean") {
        setIsLiked(data.is_liked);
      }

      if (typeof router?.reload === "function") {
        router.reload({ only: ["likedWarehouseIds", "warehouse"] });
      }
    } catch (error) {
      setIsLiked(!next);

      if (error.response?.status === 401) {
        router.get(route?.("signin") ?? "/signin", { return_to: window.location.pathname });
        return;
      }

      console.error("Failed to update wishlist", error);
    } finally {
      setBusy(false);
    }
  };

  if (!warehouse) {
    return (
      <div className="poppins w-full h-auto">
        <p className="text-sm text-gray-500">No warehouse data.</p>
      </div>
    );
  }

  return (
    <div className="poppins w-full h-auto">
      {/* Brand/Type crumb */}
      <h1 className="text-[12px] font-[600] text-[#00000080]">{titleType}</h1>

      {/* Title row */}
      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex flex-col md:flex-row gap-5">
          <h1 className="bebas-neue text-[30px]">
            {titleName} <span className="text-[#0955AC]">{titleLocation}</span>
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
            className={`w-[120px] h-[30px] rounded-[4px] border-[1px] flex flex-row justify-center items-center gap-3 ${
              isLiked ? "border-[#0955AC] bg-white text-[#0955AC]" : "border-[#00000030] bg-white text-[#0955AC]"
            } ${busy ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <Heart
              className="h-4 w-4 transition"
              stroke={"#0955AC"}
              fill={isLiked ? "#0955AC" : "none"}
            />
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
            { key: "warehouse-details", label: "Warehouse Details" },
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
      {selectedTab === "warehouse-details" && <WarehouseDetailsTab warehouse={warehouse} />}
      {selectedTab === "policies" && <PoliciesTab warehouse={warehouse} />}
      {selectedTab === "reviews" && <ReviewsTab warehouse={warehouse} />}
      {selectedTab === "gallery" && <GalleryTab warehouse={warehouse} />}
    </div>
  );
};

export default WarehouseInfo;