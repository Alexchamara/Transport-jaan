// resources/js/Pages/Web/home/land/components/VehicleImages.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import placeholderImg from "@/assets/placeholder.jpg";

// Reusable tile (fills & clips like the reference UI)
const Tile = ({ src, alt = "Vehicle", className = "" }) => (
  <div className={`relative w-full rounded-[22px] overflow-hidden ${className}`}>
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = placeholderImg; // runtime fallback only
      }}
    />
  </div>
);

const VehicleImages = ({ images: imagesProp, primaryImageUrl: primaryProp }) => {
  const { vehicle } = usePage().props || {};

  // Build ordered list of URLs: primary first, then the rest (unique)
  const urls = [];
  const primary = primaryProp ?? vehicle?.primary_image_url ?? null;
  if (primary) urls.push(primary);

  const arr = imagesProp ?? vehicle?.images ?? [];
  (Array.isArray(arr) ? arr : []).forEach((m) => {
    const u = typeof m === "string" ? m : m?.url;
    if (u && !urls.includes(u)) urls.push(u);
  });

  // If nothing at all, render nothing
  if (urls.length === 0) return null;

  const main = urls[0];
  const thumbs = urls.slice(1, 5); // 0..4 total, but don't pad with placeholders

  // Adjust columns to exactly fit how many thumbs we have (show thumbnails at `lg` breakpoint)
  let colsClass = "lg:grid-cols-[2fr,1fr,1fr]";
  if (thumbs.length === 0) colsClass = "lg:grid-cols-1";
  else if (thumbs.length <= 2) colsClass = "lg:grid-cols-[2fr,1fr]";

  return (
    <div className="w-full lg:w-[844px]">
      {/* EXACT layout feel: big left tile, then up to two stacked columns, 14px gutters */}
      <div className={`grid grid-cols-1 ${colsClass} gap-[14px] items-stretch`}>
        {/* Left big image: 435px tall on lg+ */}
        <Tile src={main} className="h-[280px] lg:h-[435px]" />

        {/* Middle column (up to two tiles) */}
        {thumbs.length > 0 && (
          <div className="hidden lg:grid grid-rows-2 gap-[14px]">
            {thumbs[0] && <Tile src={thumbs[0]} className="h-[160px] lg:h-[210px]" />}
            {thumbs[1] && <Tile src={thumbs[1]} className="h-[160px] lg:h-[210px]" />}
          </div>
        )}

        {/* Right column (up to two tiles) */}
        {thumbs.length > 2 && (
          <div className="hidden lg:grid grid-rows-2 gap-[14px]">
            {thumbs[2] && <Tile src={thumbs[2]} className="h-[160px] lg:h-[210px]" />}
            {thumbs[3] && <Tile src={thumbs[3]} className="h-[160px] lg:h-[210px]" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleImages;
