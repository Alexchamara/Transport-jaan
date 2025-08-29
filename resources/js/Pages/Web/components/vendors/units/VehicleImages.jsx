// resources/js/components/vendors/units/VehicleImages.jsx
import React, { useEffect, useMemo, useState } from "react";

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

// keep only images that actually load
const useValidatedImages = (srcs) => {
  const [valid, setValid] = useState([]);
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
  }, [JSON.stringify(srcs)]);
  return valid;
};

/* ---------- UI ---------- */
const Tile = ({ src, alt = "", className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-[16px] border border-gray-200 bg-white ${className}`}
  >
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover"
    />
  </div>
);

/**
 * Layouts:
 *  - ≥6 images: hero left + right grid with tall tile (NO gaps)
 *  - =5  images: hero left + right 2×2 grid (NO gaps)
 *  - <5 images: graceful fallbacks
 */
const VehicleImages = ({ images = [] }) => {
  const cleaned = useMemo(() => sanitizeList(images), [images]);
  const imgs = useValidatedImages(cleaned);

  if (imgs.length === 0) return null;

  const hero = imgs[0];
  const rest = imgs.slice(1);

  // === 6+ images: tall mosaic, gap-free ===
  if (imgs.length >= 6) {
    // use first 5 on the right: two top smalls, tall left (rows 2–3), mid-right, bottom-right
    const [t1, t2, tall, midRight, botRight] = rest;
    return (
      <div className="w-full grid grid-cols-3 gap-4 md:gap-6">
        <Tile
          src={hero}
          alt="Main"
          className="col-span-2 h-[240px] sm:h-[320px] md:h-[420px]"
        />
        <div className="grid grid-cols-2 grid-rows-3 gap-4 md:gap-6 h-[240px] sm:h-[320px] md:h-[420px]">
          <Tile src={t1} alt="Top left" />
          <Tile src={t2} alt="Top right" />
          <Tile src={tall} alt="Tall" className="row-span-2" />
          <Tile src={midRight} alt="Middle right" className="row-start-2 col-start-2" />
          <Tile src={botRight} alt="Bottom right" className="row-start-3 col-start-2" />
        </div>
      </div>
    );
  }

  // === Exactly 5 images: compact 2×2 on the right (no empty cell) ===
  if (imgs.length === 5) {
    const [r1, r2, r3, r4] = rest;
    return (
      <div className="w-full grid grid-cols-3 gap-4 md:gap-6">
        <Tile
          src={hero}
          alt="Main"
          className="col-span-2 h-[240px] sm:h-[320px] md:h-[420px]"
        />
        <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-6 h-[240px] sm:h-[320px] md:h-[420px]">
          <Tile src={r1} alt="Top left" />
          <Tile src={r2} alt="Top right" />
          <Tile src={r3} alt="Bottom left" />
          <Tile src={r4} alt="Bottom right" />
        </div>
      </div>
    );
  }

  // === 2–4 images: hero + as many as we have on the right ===
  if (imgs.length >= 2) {
    return (
      <div className="w-full grid grid-cols-3 gap-4 md:gap-6">
        <Tile
          src={hero}
          alt="Main"
          className="col-span-2 h-[240px] sm:h-[320px] md:h-[420px]"
        />
        <div className="grid grid-cols-2 grid-rows-2 gap-4 md:gap-6 h-[240px] sm:h-[320px] md:h-[420px]">
          {rest.map((u, i) => (
            <Tile key={i} src={u} alt={`Image ${i + 2}`} />
          ))}
        </div>
      </div>
    );
  }

  // single image
  return (
    <Tile
      src={hero}
      alt="Main"
      className="w-full h-[240px] sm:h-[320px] md:h-[420px]"
    />
  );
};

export default VehicleImages;
