import React from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../../../types/reviews';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex gap-4 pb-6 last:pb-0 last:border-0 border-b border-gray-100">
      <img
        src={review.user.avatar}
        alt={review.user.name}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{review.user.name}</span>
          <span className="text-sm text-gray-500">{review.date}</span>
        </div>
        <div className="flex items-center gap-1 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600 mt-2">{review.comment}</p>
      </div>
    </div>
  );
}