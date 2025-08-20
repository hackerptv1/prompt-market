import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface SellerInfoProps {
  author: {
    id?: string;
    name: string;
    avatar: string;
    rating?: number;
    total_reviews?: number;
    sales_count?: number;
  };
}

export function SellerInfo({ author }: SellerInfoProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <Link 
          to={author.id ? `/seller/profile/${author.id}` : "/seller/profile"}
        >
          <img
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
        </Link>
        <div>
          <Link 
            to={author.id ? `/seller/profile/${author.id}` : "/seller/profile"}
            className="font-medium text-gray-900 hover:text-blue-600"
          >
            {author.name}
          </Link>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-current" />
              <span>{(author.rating ?? 0).toFixed(1)} ({author.total_reviews ?? 0} reviews)</span>
            </div>
            <div>{author.sales_count || 0} sales</div>
          </div>
        </div>
      </div>
    </div>
  );
}