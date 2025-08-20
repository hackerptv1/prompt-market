import React from 'react';
import { Search, Filter, Star, Flag, ThumbsUp, ThumbsDown } from 'lucide-react';

export function ReviewsPage() {
  const reviews = [
    {
      id: '1',
      user: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
      },
      prompt: 'SEO Blog Generator',
      rating: 5,
      comment: 'Excellent prompt, generated amazing results!',
      date: '2024-03-15',
      status: 'approved',
      helpful: 24,
      reported: false
    },
    {
      id: '2',
      user: {
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
      },
      prompt: 'Instagram Story Pack',
      rating: 2,
      comment: 'Not what I expected, needs improvement.',
      date: '2024-03-14',
      status: 'flagged',
      helpful: 3,
      reported: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="pl-10 w-full rounded-lg border-gray-200"
              />
            </div>
            <select className="rounded-lg border-gray-200">
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{review.user.name}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{review.date}</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          review.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{review.comment}</p>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{review.helpful}</span>
                    </div>
                    {review.reported && (
                      <div className="flex items-center gap-2 text-red-500">
                        <Flag className="h-4 w-4" />
                        <span className="text-sm">Reported</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}