import React from 'react';
import { Star, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExpandableSection } from '../shared/ExpandableSection';

export function UserReviews() {
  const reviews = [
    {
      id: '1',
      promptId: '1',
      promptTitle: 'Instagram Story Generator',
      rating: 5,
      comment: 'Excellent prompt, generated amazing results! The templates are perfect for my brand.',
      date: '2024-03-15',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=150&fit=crop'
    },
    {
      id: '2',
      promptId: '2',
      promptTitle: 'SEO Blog Writer',
      rating: 4,
      comment: 'Very useful, but could use more examples. Overall great value for money.',
      date: '2024-03-14',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=150&fit=crop'
    },
    {
      id: '3',
      promptId: '3',
      promptTitle: 'Product Description AI',
      rating: 5,
      comment: 'This prompt has revolutionized how I write product descriptions. Highly recommended!',
      date: '2024-03-12',
      thumbnail: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?w=200&h=150&fit=crop'
    },
    {
      id: '4',
      promptId: '4',
      promptTitle: 'Email Marketing Suite',
      rating: 4,
      comment: 'Great email templates and subject line generator. Saved me hours of work.',
      date: '2024-03-10',
      thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=200&h=150&fit=crop'
    },
    {
      id: '5',
      promptId: '5',
      promptTitle: 'Social Media Calendar',
      rating: 5,
      comment: 'Perfect for planning my content strategy. The AI suggestions are spot on!',
      date: '2024-03-08',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=150&fit=crop'
    }
  ];

  const reviewItems = reviews.map((review) => (
    <div key={review.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
      <img
        src={review.thumbnail}
        alt={review.promptTitle}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <Link 
          to={`/prompt/${review.promptId}`}
          className="font-medium text-gray-900 hover:text-blue-600"
        >
          {review.promptTitle}
        </Link>
        <div className="flex items-center gap-1 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">{review.comment}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">{review.date}</span>
          <div className="flex gap-2">
            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
              <Edit2 className="h-4 w-4" />
            </button>
            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">My Reviews</h2>
      <div className="space-y-4">
        <ExpandableSection 
          initialItems={2} 
          items={reviewItems}
          gridCols="grid-cols-1"
          gap="gap-4"
        />
      </div>
    </div>
  );
}