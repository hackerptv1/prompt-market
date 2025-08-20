import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Marketing Director',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    content: 'The prompts I purchased have revolutionized our content creation process. We\'ve seen a 3x increase in engagement.',
    rating: 5
  },
  {
    id: '2',
    name: 'Emily Chen',
    role: 'Content Creator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'These AI prompts have helped me create consistent, high-quality content for my audience. Absolutely worth the investment!',
    rating: 5
  },
  {
    id: '3',
    name: 'Michael Brown',
    role: 'Startup Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    content: 'The ROI on these prompts has been incredible. They\'ve saved us countless hours in content creation and ideation.',
    rating: 5
  }
];

export function Testimonials() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of satisfied customers who have transformed their workflow with our prompts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-gray-50 p-6 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-600">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}