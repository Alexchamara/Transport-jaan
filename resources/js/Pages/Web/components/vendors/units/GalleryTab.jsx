import React, { useEffect, useMemo, useState } from "react";
import leftArrow from "../../../assets/landVehicleDetails/gallery/leftArrow.svg";
import rightArrow from "../../../assets/landVehicleDetails/gallery/rightArrow.svg";

/* ---------- Local fallback (existing behavior) ---------- */
const localImages = Object.values(
  import.meta.glob(
    "../../../assets/landVehicleDetails/gallery/*.{png,jpg,jpeg,webp,svg}",
    { eager: true, import: "default" }
  )
);

/* ---------- Helpers ---------- */
const sanitizeList = (arr) => {
  if (!Array.isArray(arr)) return [];
  const bad = /placeholder|dummy|sample|car1\.svg/i;
  const seen = new Set();
  return arr
    .filter((u) => typeof u === "string" && u.trim() !== "" && !bad.test(u))
    .map((u) => u.trim())
    .filter((u) => {
      const key = u.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const useValidatedImages = (srcs) => {
  const [valid, setValid] = useState([]);
  const key = useMemo(() => JSON.stringify(srcs), [srcs]);
  useEffect(() => {
    let alive = true;
    const probe = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    Promise.all(srcs.map(probe)).then((res) => {
      if (alive) setValid(res.filter(Boolean));
    });
    return () => {
      alive = false;
    };
  }, [key]);
  return valid;
};

/* ---------- Component ---------- */
/**
 * Props (all optional):
 *  - images: string[] of absolute or relative URLs from vendor uploads
 *  - vehicleId: number|string  (fetches /vendor/vehicles/{vehicleId} -> images or image)
 */
const GalleryTab = ({ images: imagesProp = [], vehicleId = null }) => {
  const [fetched, setFetched] = useState(null); // null = not fetched yet
  const [selectedImg, setSelectedImg] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Fetch vendor images if vehicleId is provided
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!vehicleId) {
        setFetched(null);
        return;
      }
      try {
        const res = await fetch(`/vendor/vehicles/${vehicleId}`, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          setFetched([]);
          return;
        }
        const json = await res.json();
        let urls = [];
        if (Array.isArray(json?.images)) urls = json.images;
        else if (typeof json?.image === "string") urls = [json.image];
        else if (Array.isArray(json?.data?.images)) urls = json.data.images;
        else if (typeof json?.data?.image === "string") urls = [json.data.image];
        if (!ignore) setFetched(urls);
      } catch {
        if (!ignore) setFetched([]);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [vehicleId]);

  // Priority: prop -> fetched -> local fallback
  const candidate = useMemo(() => {
    const a = sanitizeList(imagesProp);
    if (a.length) return a;
    const b = sanitizeList(fetched || []);
    if (b.length) return b;
    return localImages;
  }, [imagesProp, fetched]);

  const images = useValidatedImages(candidate);

  const openImage = (img, idx) => {
    setSelectedImg(img);
    setSelectedIdx(idx);
  };

  const closeImage = () => {
    setSelectedImg(null);
    setSelectedIdx(null);
  };

  const showPrev = (e) => {
    e.stopPropagation();
    if (selectedIdx > 0) {
      setSelectedImg(images[selectedIdx - 1]);
      setSelectedIdx(selectedIdx - 1);
    }
  };

  const showNext = (e) => {
    e.stopPropagation();
    if (selectedIdx < images.length - 1) {
      setSelectedImg(images[selectedIdx + 1]);
      setSelectedIdx(selectedIdx + 1);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-auto xl:w-[880px] flex justify-center items-center">
      {/* Uniform rounded thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-square rounded-[14px] overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <img
              src={img}
              alt={`Gallery ${idx + 1}`}
              loading="lazy"
              onClick={() => openImage(img, idx)}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200 ease-out"
            />
          </div>
        ))}
      </div>

      {/* Polished modal (no backdrop-click close) */}
      {selectedImg && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative flex items-center">
            {/* Close Button */}
            <button
              onClick={closeImage}
              className="absolute -top-10 right-0 text-white text-3xl font-bold z-50 hover:text-gray-300"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>

            {/* Left Arrow */}
            <button
              onClick={showPrev}
              disabled={selectedIdx === 0}
              className="absolute left-[-52px] xl:left-[-72px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/30 focus:outline-none disabled:opacity-30 z-30"
              aria-label="Previous"
              title="Previous"
            >
              <img src={leftArrow} alt="" className="w-[28px] h-[48px]" />
            </button>

            {/* Enlarged Image (size constrained) */}
            <img
              src={selectedImg}
              alt="Enlarged"
              className="max-w-[90vw] max-h-[80vh] rounded-[18px] shadow-2xl object-contain border-4 border-white"
            />

            {/* Right Arrow */}
            <button
              onClick={showNext}
              disabled={selectedIdx === images.length - 1}
              className="absolute right-[-52px] xl:right-[-72px] top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/30 focus:outline-none disabled:opacity-30 z-30"
              aria-label="Next"
              title="Next"
            >
              <img src={rightArrow} alt="" className="w-[28px] h-[48px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryTab;
