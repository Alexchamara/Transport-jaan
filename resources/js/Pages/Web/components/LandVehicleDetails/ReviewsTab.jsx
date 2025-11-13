import React, { useEffect, useState, useId } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";

/* ========= Read-only stars (supports halves) ========= */
const StarRating = ({ value = 0, size = 16, color = "#FFC107", gap = 3 }) => {
  const id = useId();
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const hasHalf = v - full >= 0.5;

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

/* ========= Interactive picker (1–5) ========= */
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
  const draw = (filled) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill={filled ? color : "none"}
        stroke={filled ? color : emptyColor}
        strokeWidth="1"
      />
    </svg>
  );
  const onKey = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, (Number(value) || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, (Number(value) || 1) - 1));
    } else if (e.key >= "1" && e.key <= "5") onChange(Number(e.key));
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
      onKeyDown={onKey}
      onMouseLeave={() => setHover(null)}
      style={{ gap }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const filled = hover ? idx <= hover : idx <= value;
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
            {draw(filled)}
          </button>
        );
      })}
    </div>
  );
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

const displayName = (client) => {
  const raw = (client?.name || "").trim();
  if (raw && !/^provider$/i.test(raw)) return raw; // use real name unless it's literally "Provider"
  return client?.email || "Anonymous";
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

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setRating(5);
    setComment("");
  }, [vehicle?.id]);

  const canSubmit =
    rating >= 1 && rating <= 5 && Boolean(vehicle?.id) && authUser?.role === "client";

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    router.post(
      route("client.vehicles.reviews.store", vehicle.id),
      { rating, comment },
      {
        preserveScroll: true,
        onSuccess: () => {
          setRating(5);
          setComment("");
          // Refresh only what we need; adjust the partials to match your controller props.
          router.reload({ only: ["vehicle"] });
        },
      }
    );
  };

  return (
    <div className="poppins">
      {/* Header with count */}
      <div className="flex flex-row gap-5 items-center">
        <h1 className="text-[20px] font-[700]">Review</h1>
        <div className="w-[44px] h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center text-[14px] font-[700] text-white">
          {totalReviews}
        </div>
      </div>

      {/* Average panel */}
      <div className="flex flex-row gap-8 items-center mb-10">
        <div>
          <h1 className="text-[50px] font-[700]">
            {average !== null ? average.toFixed(1) : "—"}
          </h1>
          <StarRating value={average ?? 0} size={16} />
          <h1 className="text-[#90A3BF] mt-2">{totalReviews}</h1>
        </div>

        {/* Static distribution bars (replace with real histogram if you expose it) */}
        <div className="flex flex-col gap-2 mt-5">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n} className="flex flex-row justify-center items-center gap-3">
              <h1 className="text-[8px] font-[600]">{n}</h1>
              <div className="w-[274px] h-[9px] bg-[#D9D9D9] rounded-[10px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Add review form (clients only) */}
      {authUser?.role === "client" ? (
        <form onSubmit={submit} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-semibold">Your rating:</label>
            <StarPicker value={rating} onChange={setRating} className="ml-1" size={18} />
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

      {/* Reviews list */}
      <div className="bg-white rounded-2xl border border-[#EDEFF3] shadow-sm overflow-hidden">
        {Array.isArray(vehicle?.reviews) && vehicle.reviews.length > 0 ? (
          <ul className="divide-y divide-[#F1F3F7]">
            {vehicle.reviews.map((r) => {
              const name = displayName(r?.client);
              const dateStr = r?.created_at
                ? new Date(r.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })
                : "—";
              const ratingNum = Number(r?.rating) || 0;
              const avatarUrl = r?.client?.avatar_url;

              return (
                <li key={r.id} className="p-6">
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#E7EEF9] text-[#1F2A44] flex items-center justify-center text-sm font-semibold">
                        {initials(name) || "U"}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-[700] text-[#0F172A] truncate">
                        {name}
                      </div>
                      <div className="text-[#CBD5E1] text-[18px] leading-none">
                        {r?.client?.country || "—"}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="text-[13px] text-[#90A3BF]">{dateStr}</div>
                      <StarRating value={ratingNum} size={16} />
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-7 text-[#1f2937] whitespace-pre-line">
                    {r?.comment || "—"}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-6 text-sm text-[#90A3BF]">
            No reviews yet. Be the first to share your experience!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
