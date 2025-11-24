'use client';

import React from 'react';
import StarRating from './StarRating';

type Review = {
    id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
    user: {
        id: string;
        email: string;
    };
};

type ReviewsListProps = {
    reviews: Review[];
    loading?: boolean;
};

export default function ReviewsList({ reviews, loading = false }: ReviewsListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-6 animate-pulse">
                        <div className="h-4 bg-zinc-200 rounded w-1/4 mb-3"></div>
                        <div className="h-3 bg-zinc-200 rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
                <p className="text-zinc-500">No reviews yet. Be the first to review this partner!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {review.user.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-zinc-900">
                                        {review.user.email?.split('@')[0] || 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <StarRating value={review.rating} readonly size="sm" />
                    </div>

                    {/* Review Text */}
                    {review.review_text && (
                        <p className="text-sm text-zinc-700 leading-relaxed">
                            {review.review_text}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
