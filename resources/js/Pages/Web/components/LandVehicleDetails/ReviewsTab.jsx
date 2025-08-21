import React, { useEffect, useMemo, useState, useId } from "react";
import { usePage, router } from "@inertiajs/react";
import ReviewSection from "../vehicleDetails/ReviewSection";

/** Gold star display (read-only, supports halves) */
const StarRating = ({ value = 0, size = 16, color = "#FFC107", gap = 3 }) => {
  const id = useId();
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;

  const Star = ({ filled, half }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1"
      />
      {half && (
        <>
          <defs>
            <linearGradient id={`half-${id}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={`url(#half-${id})`}
            stroke="none"
          />
        </>
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

/** Interactive star input (1–5, integer) — no border/ring */
const StarPicker = ({
  value = 5,
  onChange,
  size = 18,
  color = "#FFC107",
  emptyColor = "#E5E7EB",
  gap = 4,
  className = "",
}) => {
  const [hover, setHover] = useState(null);

  const drawStar = (filled) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={filled ? color : "none"}
        stroke={filled ? color : emptyColor}
        strokeWidth="1"
      />
    </svg>
  );

  const handleKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (Number(value) || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, (Number(value) || 1) - 1));
    } else if (e.key >= "1" && e.key <= "5") {
      onChange(Number(e.key));
    }
  };

  return (
    <div
      className={`inline-flex items-center ${className}`}
      role="slider"
      aria-label="Rating"
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={handleKey}
      onMouseLeave={() => setHover(null)}
      style={{ gap }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const isFilled = hover ? idx <= hover : idx <= value;
        return (
          <button
            key={idx}
            type="button"
            onMouseEnter={() => setHover(idx)}
            onFocus={() => setHover(idx)}
            onClick={() => onChange(idx)}
            className="focus:outline-none"
            aria-label={`${idx} star${idx > 1 ? "s" : ""}`}
          >
            {drawStar(isFilled)}
          </button>
        );
      })}
    </div>
  );
};

const ReviewsTab = () => {
  const { props } = usePage();
  const vehicle = props?.vehicle || {};
  const authUser = props?.auth?.user || null;

  const totalReviews =
    vehicle?.reviews_count ??
    (Array.isArray(vehicle?.reviews) ? vehicle.reviews.length : 0) ??
    0;

  const average =
    vehicle?.rating_avg !== undefined && vehicle?.rating_avg !== null
      ? Number(vehicle.rating_avg)
      : null;

  // Fresh form every time (no update/delete UI)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Reset form if vehicle changes
  useEffect(() => {
    setRating(5);
    setComment("");
  }, [vehicle?.id]);

  const canSubmit = rating >= 1 && rating <= 5 && Boolean(vehicle?.id);

  const submit = (e) => {
    e.preventDefault();
    if (!authUser || authUser.role !== "client" || !canSubmit) return;

    router.post(
      `/vehicles/${vehicle.id}/reviews`,
      { rating, comment },
      {
        preserveScroll: true,
        onSuccess: () => {
          // Clear form and refresh vehicle props (reviews + aggregates)
          setRating(5);
          setComment("");
          router.reload({ only: ["vehicle"] });
        },
      }
    );
  };

  return (
    <div className="poppins">
      <div className="flex flex-row gap-5 items-center">
        <h1 className="text-[20px] font-[700]">Review</h1>
        <div className="w-[44px] h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center text-[14px] font-[700] text-[#FFFFFF]">
          {totalReviews}
        </div>
      </div>

      <div className="flex flex-row gap-8 items-center mb-10">
        <div>
          <h1 className="text-[50px] font-[700]">
            {average !== null ? average.toFixed(1) : "—"}
          </h1>
          {/* Dynamic gold stars for average */}
          <StarRating value={average ?? 0} size={16} />
          <h1 className="text-[#90A3BF] mt-2">{totalReviews}</h1>
        </div>

        {/* keep your static gray bars */}
        <div className="flex flex-col gap-2 mt-5">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="flex flex-row justify-center items-center gap-3">
              <h1 className="text-[8px] font-[600]">{n}</h1>
              <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Add review form (only for logged-in clients) */}
      {authUser?.role === "client" ? (
        <form onSubmit={submit} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-semibold">Your rating:</label>
            <StarPicker
              value={rating}
              onChange={setRating}
              className="ml-1"
              size={18} // smaller picker
            />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            className="w-full border rounded p-3 text-sm"
            rows={4}
            maxLength={2000}
          />

          <div className="mt-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 bg-[#0955AC] text-white rounded font-semibold text-sm disabled:opacity-60"
            >
              Submit Review
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 text-sm text-[#90A3BF]">
          Please sign in as a client to leave a review.
        </div>
      )}

      <ReviewSection />
    </div>
  );
};

export default ReviewsTab;
