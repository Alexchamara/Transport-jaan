import React, { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";

import leftArrow from "../../assets/landVehicleDetails/gallery/leftArrow.svg";
import rightArrow from "../../assets/landVehicleDetails/gallery/rightArrow.svg";

/* Normalize backend shapes to a usable URL */
const toUrl = (item) => {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (item.url) return item.url;                   // accessor on model
  if (item.path) return `/storage/${item.path}`;   // raw storage path
  if (item.image_path) return `/storage/${item.image_path}`;
  return null;
};

const GalleryTab = ({ images: imagesProp, vehicle: vehicleProp }) => {
  // prefer explicit props; else use Inertia page props
  const { vehicle: pageVehicle } = usePage().props || {};
  const vehicle = vehicleProp ?? pageVehicle ?? {};

  // build gallery URLs (primary first, then others)
  const images = useMemo(() => {
    const urls = [];

    (Array.isArray(imagesProp) ? imagesProp : []).forEach((it) => {
      const u = toUrl(it);
      if (u && !urls.includes(u)) urls.push(u);
    });

    const primaryCandidates = [
      vehicle.primary_image_url,
      vehicle.image,
      vehicle.primaryImage?.url,
      vehicle.primaryImage?.path && `/storage/${vehicle.primaryImage.path}`,
      vehicle.primaryImage?.image_path &&
        `/storage/${vehicle.primaryImage.image_path}`,
    ];
    for (const c of primaryCandidates) {
      const u = toUrl(c);
      if (u && !urls.includes(u)) {
        urls.unshift(u);
        break;
      }
    }

    const arrays =
      vehicle.images ??
      vehicle.media ??
      vehicle.photos ??
      vehicle.gallery ??
      vehicle.image_gallery ??
      vehicle.pictures ??
      [];

    (Array.isArray(arrays) ? arrays : []).forEach((it) => {
      const u = toUrl(it);
      if (u && !urls.includes(u)) urls.push(u);
    });

    return urls;
  }, [imagesProp, vehicle]);

  if (!images.length) return null;

  const [selectedIdx, setSelectedIdx] = useState(null);
  const selectedImg = selectedIdx !== null ? images[selectedIdx] : null;

  const openImage = (_img, idx) => setSelectedIdx(idx);
  const closeImage = () => setSelectedIdx(null);
  const showPrev = (e) => {
    e.stopPropagation();
    setSelectedIdx((i) => (i > 0 ? i - 1 : i));
  };
  const showNext = (e) => {
    e.stopPropagation();
    setSelectedIdx((i) => (i < images.length - 1 ? i + 1 : i));
  };

  return (
    <div className="relative w-full xl:w-[880px] flex justify-center items-center">
      {/* SAME 4×4 grid, but each tile has a fixed height box */}
      <div className="grid grid-cols-4 grid-rows-4 gap-5">
        {images.map((src, idx) => (
          <button
            key={`${src}-${idx}`}
            type="button"
            onClick={() => openImage(src, idx)}
            className="cursor-pointer"
          >
            {/* Fixed-size tile (tweak heights if you want slightly taller/shorter) */}
            <div className="w-full h-[170px] rounded-[12px] overflow-hidden bg-[#F4F3F3]">
              <img
                src={src}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // hide broken image; the gray tile stays so grid remains tidy
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </button>
        ))}
      </div>

      {selectedImg && (
        <div
          className="absolute inset-0 bg-[#000000BF] rounded-[20px] bg-opacity-90 flex items-center justify-center z-20"
          onClick={closeImage}
        >
          <div
            className="relative flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Arrow */}
            <button
              onClick={showPrev}
              disabled={selectedIdx === 0}
              className="absolute left-[-60px] xl:left-[-80px] top-1/2 transform -translate-y-1/2 bg-transparent border-none focus:outline-none disabled:opacity-30 z-30"
            >
              <img src={leftArrow} alt="Previous" className="w-[30px] h-[53px]" />
            </button>

            {/* Enlarged Image */}
            <img
              src={selectedImg}
              alt="Enlarged"
              className="xl:w-[511px] xl:h-[511px] rounded shadow-lg object-contain"
              onError={closeImage}
            />

            {/* Right Arrow */}
            <button
              onClick={showNext}
              disabled={selectedIdx === images.length - 1}
              className="absolute right-[-60px] xl:right-[-80px] top-1/2 transform -translate-y-1/2 bg-transparent border-none focus:outline-none disabled:opacity-30 z-30"
            >
              <img src={rightArrow} alt="Next" className="w-[30px] h-[53px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryTab;
