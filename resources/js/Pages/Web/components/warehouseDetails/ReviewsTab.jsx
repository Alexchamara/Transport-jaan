import React from "react";
import star from "../../assets/driverBooking/star.svg";

const ReviewsTab = ({ warehouse }) => {
  const reviews = warehouse?.reviews || [];
  const rating = warehouse?.rating_avg || warehouse?.rating || 0;
  const reviewCount = warehouse?.reviews_count || reviews.length || 0;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Date not available';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <img key={i} src={star} alt="star" className="w-4 h-4" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <img src={star} alt="star" className="w-4 h-4 opacity-30" />
            <div className="absolute inset-0 w-1/2 overflow-hidden">
              <img src={star} alt="star" className="w-4 h-4" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <img key={i} src={star} alt="star" className="w-4 h-4 opacity-30" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
          <div className="text-center md:text-left">
            <div className="text-3xl font-bold text-[#0955AC] mb-2">
              {rating ? rating.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center gap-1 mb-2">
              {renderStars(rating)}
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
                  <img src={star} alt="star" className="w-3 h-3" />
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
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
          {reviews.map((review, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {review.customer_name || review.user?.name || 'Anonymous User'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating || 0)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {review.stay_duration && `Stored for ${review.stay_duration}`}
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
              
              {review.pros && (
                <div className="mt-3">
                  <h5 className="text-sm font-semibold text-green-700 mb-1">Pros:</h5>
                  <p className="text-sm text-gray-600">{review.pros}</p>
                </div>
              )}
              
              {review.cons && (
                <div className="mt-2">
                  <h5 className="text-sm font-semibold text-red-700 mb-1">Cons:</h5>
                  <p className="text-sm text-gray-600">{review.cons}</p>
                </div>
              )}
              
              {/* Helpful votes */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-[#0955AC] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4l-3-1m6-5v11" />
                    </svg>
                    Helpful ({review.helpful_votes || 0})
                  </button>
                  <button className="text-gray-500 hover:text-[#0955AC] transition-colors">
                    Reply
                  </button>
                </div>
                
                {review.verified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Stay
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {/* Load More Button */}
          {reviews.length >= 10 && (
            <div className="text-center">
              <button className="px-6 py-2 border border-[#0955AC] text-[#0955AC] rounded-lg hover:bg-[#0955AC] hover:text-white transition-colors">
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      ) : (
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
          <button className="px-6 py-2 bg-[#0955AC] text-white rounded-lg hover:bg-[#0744A0] transition-colors">
            Write a Review
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;