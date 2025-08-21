import React, { useMemo, useState, useId } from "react";
import { usePage } from "@inertiajs/react";
import proPic from "../../assets/vehicleDetails/proPic.png";
import arrow from "../../assets/landVehicleDetails/arrow.svg";

/** Small reusable star rating (SVG, gold) */
const StarRating = ({ value = 0, size = 18, color = "#FFC107", gap = 2 }) => {
  const id = useId(); // unique ids for gradient/masks per component instance
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;

  // Basic star path (24x24 viewbox)
  const Star = ({ filled, half }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "inline-block" }}
      aria-hidden="true"
    >
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.2"
      />
      {half && (
        <defs>
          <linearGradient id={`half-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      {half && (
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={`url(#half-${id})`}
          stroke="none"
        />
      )}
    </svg>
  );

  return (
    <div style={{ display: "inline-flex", gap }}>
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const filled = idx <= full;
        const half = !filled && hasHalf && idx === full + 1;
        return <Star key={idx} filled={filled} half={half} />;
      })}
    </div>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(iso);
  }
};

const ReviewSection = () => {
  const { props } = usePage();
  const raw = props?.vehicle?.reviews || [];

  const reviews = useMemo(
    () =>
      raw.map((r) => ({
        id: r.id,
        name: r?.client?.name ?? "Anonymous", // client from users table
        location: r?.client?.country ?? r?.client?.location ?? "",
        date: formatDate(r?.created_at),
        rating: Number(r?.rating ?? 0), // drives gold stars
        comment: r?.comment ?? "",
      })),
    [raw]
  );

  const [showMore, setShowMore] = useState(false);
  const displayedReviews = showMore ? reviews : reviews.slice(0, 4);

  if (!reviews.length) {
    return (
      <div className="plus-jakarta-sans w-auto h-auto xl:h-auto rounded-[10px] py-5">
        <p className="text-[12px] text-[#90A3BF]">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="plus-jakarta-sans w-auto h-auto xl:h-auto rounded-[10px] py-5  ">
      {displayedReviews.map((review) => (
        <div key={review.id} className="flex flex-col gap-3 py-5 text-[12px] font-[500] ">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-row gap-3 items-center">
              <img src={proPic} alt="Profile" />
              <div className="flex flex-col items-start gap-2">
                <h1 className="text-[14px] font-[700]">{review.name}</h1>
                <h1 className="text-[#90A3BF]">{review.location || "—"}</h1>
              </div>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-2">
              <h1 className="text-[#90A3BF]">{review.date}</h1>
              {/* Dynamic gold stars per review */}
              <StarRating value={review.rating} size={18} />
            </div>
          </div>
          <div>
            <p className="font-[400] text-[12px]/[33px] text-justify">{review.comment}</p>
          </div>
        </div>
      ))}

      {reviews.length > 2 && (
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-[#0955AC] text-[14px] font-[700] border-[1.5px] w-[175px] h-[47px] justify-center rounded-[8px] border-[#0955AC] transition-colors duration-200 flex items-center gap-2"
          >
            <span>{showMore ? "Show Less Reviews" : "See All Reviews"}</span>
            <img
              src={arrow}
              alt="Arrow"
              className={`size-[24px] transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;

