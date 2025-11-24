'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StarRating from './StarRating';

type ReviewFormProps = {
    partnerId: string;
    partnerName: string;
    onReviewSubmitted?: () => void;
};

export default function ReviewForm({ partnerId, partnerName, onReviewSubmitted }: ReviewFormProps) {
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [existingReview, setExistingReview] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadUserAndReview() {
            setLoading(true);
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (currentUser) {
                    // Fetch existing review if any
                    const res = await fetch(`/api/reviews/${partnerId}/user`);
                    if (res.ok) {
                        const { review } = await res.json();
                        if (review) {
                            setExistingReview(review);
                            setRating(review.rating);
                            setReviewText(review.review_text || '');
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading review:', error);
            } finally {
                setLoading(false);
            }
        }

        loadUserAndReview();
    }, [partnerId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user || rating === 0) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partnerId,
                    rating,
                    reviewText: reviewText.trim() || null,
                }),
            });

            if (res.ok) {
                onReviewSubmitted?.();
                const { review } = await res.json();
                setExistingReview(review);
            } else {
                const { error } = await res.json();
                alert(`Error: ${error}`);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                <p className="text-sm text-zinc-500">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                <p className="text-sm text-zinc-600">Please log in to leave a review.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">
                {existingReview ? 'Update Your Review' : `Rate ${partnerName}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Your Rating
                    </label>
                    <StarRating value={rating} onChange={setRating} size="lg" />
                </div>

                {/* Review Text */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Your Review (Optional)
                    </label>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience working with this manufacturer..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                        {reviewText.length}/500 characters
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="w-full px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
            </form>

            {existingReview && (
                <p className="mt-3 text-xs text-zinc-500">
                    You submitted this review on {new Date(existingReview.created_at).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
