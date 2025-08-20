import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import type { Review } from '../../../types/reviews';

interface ReviewListProps {
  reviews: Review[];
  showAllReviews: boolean;
  onToggleShowAll: () => void;
}

export function ReviewList({ reviews, showAllReviews, onToggleShowAll }: ReviewListProps) {
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6">Recent Reviews</h3>

      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 5 && (
        <div className="mt-8 text-center">
          <button
            onClick={onToggleShowAll}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAllReviews ? (
              <>
                Show Less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show All Reviews
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}