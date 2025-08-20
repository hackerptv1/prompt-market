import React from 'react';
import { Star } from 'lucide-react';

interface Rating {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  date: string;
}

interface RatingSectionProps {
  ratings: Rating[];
  stats: {
    average: number;
    total: number;
    distribution: number[];
  };
}

export function RatingSection({ ratings, stats }: RatingSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-8">
        {/* Overall Rating */}
        <div className="flex-1">
          <div className="text-5xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} 
                    className={`h-5 w-5 ${i < Math.round(stats.average) 
                      ? 'text-amber-400 fill-current' 
                      : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-1">{stats.total} ratings</div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-[2]">
          {stats.distribution.map((count, index) => {
            const percentage = (count / stats.total) * 100;
            return (
              <div key={5 - index} className="flex items-center gap-2 text-sm">
                <div className="w-12 text-gray-600">{5 - index} stars</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-gray-600">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="space-y-4">
        {/* <h3 className="font-semibold text-gray-900">Recent Reviews</h3> */}
        <div className="space-y-4">
          {ratings.slice(0, 5).map((rating) => (
            <div key={rating.id} className="flex gap-4">
              <img
                src={rating.user.avatar}
                alt={rating.user.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{rating.user.name}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} 
                            className={`h-4 w-4 ${i < rating.rating 
                              ? 'fill-current' 
                              : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mt-1">{rating.comment}</p>
                <div className="text-sm text-gray-500 mt-1">{rating.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
      alert(`${title}\n${description}`);
    }
  };
}