import React, { useState } from 'react';
import { Review, getWhatsAppUrl } from '../types';
import { Star, CheckCircle, MessageSquare, Plus, X } from 'lucide-react';
import { addReview } from '../services/db';

interface ReviewsSectionProps {
  reviews: Review[];
  onReviewAdded?: (review: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, onReviewAdded }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [service, setService] = useState('Acrylic Full Set');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      name: name.trim(),
      rating,
      service,
      comment: comment.trim(),
      date: 'Just now',
      verified: true,
    };

    try {
      await addReview(newRev);
      if (onReviewAdded) onReviewAdded(newRev);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setModalOpen(false);
        setName('');
        setComment('');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
              Client Testimonials
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900">
              Loved by Discerning Hands
            </h2>
            <p className="text-stone-600 text-sm max-w-xl">
              Real reviews from real clients. See what women in Lagos are saying about their Fazzynails experience.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Leave a Review</span>
            </button>

            <a
              href={getWhatsAppUrl("Hello Fazzynails, I wanted to share feedback about my recent nail set!")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
                </div>

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-stone-900 block">
                    {rev.name}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    {rev.service}
                  </span>
                </div>

                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-editorial text-2xl font-bold text-stone-900">Thank You!</h3>
                <p className="text-xs text-stone-600">Your review was saved to our salon register.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Rate Your Experience
                </h3>
                <p className="text-xs text-stone-500">
                  Help other clients discover why Fazzynails speaks class.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer focus:outline-hidden"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Stephanie K."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Service Received</label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  >
                    <option value="Acrylic Full Set">Acrylic Full Set (₦15,000)</option>
                    <option value="Gel Polish Manicure">Gel Polish Manicure (₦3,000)</option>
                    <option value="French Ombre Acrylic">French Ombre Acrylic</option>
                    <option value="BIAB Builder Gel Overlay">BIAB Builder Gel</option>
                    <option value="Luxury Spa Pedicure">Luxury Spa Pedicure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the nail shape, retention, and studio cleanliness..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Publishing...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
