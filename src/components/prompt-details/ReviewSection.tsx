import React, { useState, useEffect } from 'react';
import { ReviewForm } from './reviews/ReviewForm';
import { ReviewList } from './reviews/ReviewList';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { Review } from '../../types/reviews';

interface ReviewSectionProps {
  promptId: string;
}

export function ReviewSection({ promptId }: ReviewSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isPromptOwner, setIsPromptOwner] = useState(false);
  const [promptSellerId, setPromptSellerId] = useState<string | null>(null);

  // Fetch prompt's seller_id
  useEffect(() => {
    async function fetchPromptSeller() {
      const { data, error } = await supabase
        .from('prompts')
        .select('seller_id')
        .eq('id', promptId)
        .single();
      if (!error && data) {
        setPromptSellerId(data.seller_id);
        setIsPromptOwner(!!user && data.seller_id === user.id);
      }
    }
    if (promptId && user) {
      fetchPromptSeller();
    }
  }, [promptId, user]);

  // Fetch reviews for this prompt
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      // Join with profiles to get name and avatar
      const { data, error } = await supabase
        .from('prompt_reviews')
        .select(`id, created_at, rating, comment, reviewer_id, profiles:reviewer_id(full_name, profile_picture_url)`)
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const mapped: Review[] = data.map((r: any) => ({
          id: r.id,
          user: {
            name: r.profiles?.full_name || 'Anonymous',
            avatar: r.profiles?.profile_picture_url || 'https://ui-avatars.com/api/?name=User',
          },
          rating: r.rating,
          comment: r.comment,
          date: formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
        }));
        setReviews(mapped);
        // Check if current user has reviewed
        setHasReviewed(!!user && data.some((r: any) => r.reviewer_id === user.id));
      }
      setLoading(false);
    }
    fetchReviews();
  }, [promptId, user]);

  // Submit a new review
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('prompt_reviews').insert({
      prompt_id: promptId,
      reviewer_id: user.id,
      rating,
      comment,
    });
    setSubmitting(false);
    if (!error) {
      // Refresh reviews
      setHasReviewed(true);
      // Re-fetch reviews
      const { data } = await supabase
        .from('prompt_reviews')
        .select(`id, created_at, rating, comment, reviewer_id, profiles:reviewer_id(full_name, profile_picture_url)`)
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped: Review[] = data.map((r: any) => ({
          id: r.id,
          user: {
            name: r.profiles?.full_name || 'Anonymous',
            avatar: r.profiles?.profile_picture_url || 'https://ui-avatars.com/api/?name=User',
          },
          rating: r.rating,
          comment: r.comment,
          date: formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
        }));
        setReviews(mapped);
      }
      // --- Update seller's average_rating and total_reviews ---
      if (promptSellerId) {
        // 1. Get all prompt IDs for this seller
        const { data: prompts } = await supabase
          .from('prompts')
          .select('id')
          .eq('seller_id', promptSellerId);
        if (prompts && prompts.length > 0) {
          const promptIds = prompts.map((p: any) => p.id);
          // 2. Get all reviews for these prompts
          const { data: allReviews } = await supabase
            .from('prompt_reviews')
            .select('rating')
            .in('prompt_id', promptIds);
          const allReviewsSafe = allReviews || [];
          const totalReviews = allReviewsSafe.length;
          const averageRating = totalReviews > 0
            ? allReviewsSafe.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
            : 0;
          // Log values for debugging
          console.log('Updating seller stats:', {
            average_rating: averageRating,
            total_reviews: totalReviews,
            seller_id: promptSellerId
          });
          // Validate before update
          if (
            typeof averageRating === 'number' &&
            !isNaN(averageRating) &&
            typeof totalReviews === 'number' &&
            !isNaN(totalReviews)
          ) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                average_rating: averageRating,
                total_reviews: totalReviews,
              })
              .eq('id', promptSellerId);
            if (updateError) {
              console.error('Failed to update seller stats:', updateError);
            } else {
              console.log('Seller stats updated successfully');
            }
          } else {
            console.error('Invalid stats:', { averageRating, totalReviews });
          }
        }
      }
      // --- End update seller stats ---
    } else {
      alert('Failed to submit review.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Only show form if user is not prompt owner and hasn't reviewed */}
      {user && !isPromptOwner && !hasReviewed && (
      <ReviewForm onSubmit={handleSubmitReview} />
      )}
      <ReviewList
        reviews={reviews}
        showAllReviews={showAllReviews}
        onToggleShowAll={() => setShowAllReviews(!showAllReviews)}
      />
      {loading && <div>Loading reviews...</div>}
      {user && hasReviewed && <div className="text-green-600">You have already reviewed this prompt.</div>}
      {user && isPromptOwner && <div className="text-blue-600">You cannot review your own prompt.</div>}
    </div>
  );
}