import React, { useMemo, useState, useId } from "react";
import { usePage, router } from "@inertiajs/react";
import proPic from "../../assets/vehicleDetails/proPic.png";
import arrow from "../../assets/landVehicleDetails/arrow.svg";

const StarRating = ({ value = 0, size = 18, color = "#FFC107", gap = 2 }) => {
  const id = useId();
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;

  const Star = ({ filled, half }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block" }} aria-hidden="true">
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

const displayName = (user) => {
  const raw = (user?.name || "").trim();
  if (raw && !/^provider$/i.test(raw)) return raw;
  return user?.email || "Anonymous";
};

const ReviewsTab = ({ warehouse }) => {
  const { props } = usePage();
  const raw = Array.isArray(warehouse?.reviews) ? warehouse.reviews : [];

  const reviews = useMemo(
    () =>
      raw.map((r) => ({
        id: r.id,
        name: displayName(r?.user),
        location: r?.user?.country ?? r?.user?.location ?? "",
        date: formatDate(r?.created_at),
        rating: Number(r?.rating ?? 0),
        comment: r?.comment ?? "",
        pros: r?.pros ?? "",
        cons: r?.cons ?? "",
        helpful_votes: r?.helpful_votes ?? 0,
        verified: r?.verified ?? false,
        stay_duration: r?.stay_duration ?? "",
      })),
    [raw]
  );

  const [showMore, setShowMore] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    pros: '',
    cons: '',
    stay_duration: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const displayedReviews = showMore ? reviews : reviews.slice(0, 4);

  const rating = parseFloat(warehouse?.rating_avg || warehouse?.rating || 0);
  const reviewCount = warehouse?.reviews_count || reviews.length || 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!props?.auth?.user) {
      router.get(route?.("signin") ?? "/signin", { return_to: window.location.pathname });
      return;
    }

    if (reviewForm.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    try {
      await router.post('/warehouse-reviews', {
        warehouse_unit_id: warehouse?.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        pros: reviewForm.pros.trim() || null,
        cons: reviewForm.cons.trim() || null,
        stay_duration: reviewForm.stay_duration.trim() || null,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setShowReviewModal(false);
          setReviewForm({
            rating: 0,
            comment: '',
            pros: '',
            cons: '',
            stay_duration: ''
          });
          // Refresh the page data to show new review
          router.reload({ only: ['warehouse'] });
        },
        onError: (errors) => {
          console.error('Review submission error:', errors);
          alert('Failed to submit review. Please try again.');
        }
      });
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (newRating) => {
    setReviewForm(prev => ({ ...prev, rating: newRating }));
  };

  const openReviewModal = () => {
    if (!props?.auth?.user) {
      router.get(route?.("signin") ?? "/signin", { return_to: window.location.pathname });
      return;
    }
    setShowReviewModal(true);
  };

  if (!reviews.length) {
    return (
      <div className="plus-jakarta-sans w-auto h-auto xl:h-auto rounded-[10px] py-5">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 mb-6">
            Be the first to review this warehouse facility and help other customers make informed decisions.
          </p>
          <button 
            onClick={openReviewModal}
            className="px-6 py-2 bg-[#0955AC] text-white rounded-lg hover:bg-[#0744A0] transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="plus-jakarta-sans w-auto h-auto xl:h-auto rounded-[10px] py-5">
      {/* Rating Summary */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-[#0955AC] mb-2">
              {rating ? rating.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center gap-1 mb-2 justify-center md:justify-start">
              <StarRating value={rating} size={18} />
            </div>
            <p className="text-sm text-gray-600">
              Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Rating Breakdown */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter(review => Math.floor(review.rating || 0) === stars).length;
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              
              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-2">{stars}</span>
                  <StarRating value={1} size={12} />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#0955AC] h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      {displayedReviews.map((review) => (
        <div key={review.id} className="flex flex-col gap-3 py-5 text-[12px] font-[500] border-b border-gray-100 last:border-b-0">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-row gap-3 items-center">
              <img src={proPic} alt="Profile" className="w-10 h-10 rounded-full" />
              <div className="flex flex-col items-start gap-2">
                <h1 className="text-[14px] font-[700]">{review.name}</h1>
                <h1 className="text-[#90A3BF]">{review.location || "—"}</h1>
              </div>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-2">
              <h1 className="text-[#90A3BF]">{review.date}</h1>
              <StarRating value={review.rating} size={16} />
              {review.stay_duration && (
                <p className="text-[10px] text-[#90A3BF]">Stored for {review.stay_duration}</p>
              )}
            </div>
          </div>
          
          <div>
            {review.comment && (
              <p className="font-[400] text-[12px]/[20px] text-justify mb-3">{review.comment}</p>
            )}
            
            {review.pros && (
              <div className="mb-2">
                <h5 className="text-[11px] font-[600] text-green-700 mb-1">Pros:</h5>
                <p className="text-[11px] text-gray-600">{review.pros}</p>
              </div>
            )}
            
            {review.cons && (
              <div className="mb-2">
                <h5 className="text-[11px] font-[600] text-red-700 mb-1">Cons:</h5>
                <p className="text-[11px] text-gray-600">{review.cons}</p>
              </div>
            )}

            {/* Helpful votes and verification */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-[10px]">
                <button className="flex items-center gap-1 text-gray-500 hover:text-[#0955AC] transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4l-3-1m6-5v11" />
                  </svg>
                  Helpful ({review.helpful_votes})
                </button>
              </div>
              
              {review.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[9px] font-medium bg-green-100 text-green-800">
                  <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Stay
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {reviews.length > 4 && (
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="focus:outline-none transition-colors"
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24"
                        className={`cursor-pointer ${
                          star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <path
                          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewForm.rating > 0 ? `${reviewForm.rating} star${reviewForm.rating !== 1 ? 's' : ''}` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0955AC] focus:border-[#0955AC]"
                  placeholder="Share your experience with this warehouse facility..."
                  required
                />
              </div>

              {/* Storage Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Duration (Optional)
                </label>
                <input
                  type="text"
                  value={reviewForm.stay_duration}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, stay_duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0955AC] focus:border-[#0955AC]"
                  placeholder="e.g., 6 months, 2 years"
                />
              </div>

              {/* Pros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you like? (Optional)
                </label>
                <textarea
                  value={reviewForm.pros}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, pros: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0955AC] focus:border-[#0955AC]"
                  placeholder="What were the best aspects of this warehouse?"
                />
              </div>

              {/* Cons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What could be improved? (Optional)
                </label>
                <textarea
                  value={reviewForm.cons}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, cons: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0955AC] focus:border-[#0955AC]"
                  placeholder="Any areas for improvement?"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reviewForm.rating === 0 || !reviewForm.comment.trim()}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#0955AC] border border-transparent rounded-md hover:bg-[#0744A0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0955AC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;