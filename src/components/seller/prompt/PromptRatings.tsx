import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';

interface PromptRatingsProps {
  promptId: string | undefined;
}

export function PromptRatings({ promptId }: PromptRatingsProps) {
  const [replyText, setReplyText] = useState<string>('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Mock data - replace with actual API call
  const ratings = [
    {
      id: '1',
      user: {
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      rating: 5,
      comment: 'Excellent prompt, generated amazing results!',
      date: '2 days ago',
      reply: null,
    },
    {
      id: '2',
      user: {
        name: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      rating: 4,
      comment: 'Good prompt but could use more examples.',
      date: '1 week ago',
      reply: 'Thank you for your feedback! I\'ll add more examples in the next update.',
    },
  ];

  const handleReply = (ratingId: string) => {
    console.log('Reply submitted:', { ratingId, text: replyText });
    setReplyText('');
    setActiveReplyId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Customer Ratings & Reviews</h2>
      
      <div className="space-y-6">
        {ratings.map((rating) => (
          <div key={rating.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-start gap-4">
              <img
                src={rating.user.avatar}
                alt={rating.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rating.user.name}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating.rating ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mt-1">{rating.comment}</p>
                <div className="text-sm text-gray-500 mt-1">{rating.date}</div>

                {rating.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-100">
                    <p className="text-gray-600 text-sm">{rating.reply}</p>
                    <div className="text-xs text-gray-500 mt-1">Your reply</div>
                  </div>
                )}

                {!rating.reply && (
                  <div className="mt-3">
                    {activeReplyId === rating.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(rating.id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyId(rating.id)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}