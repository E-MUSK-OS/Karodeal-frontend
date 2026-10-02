'use client';
import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const writeParam = searchParams.get('write');

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isWriting, setIsWriting] = useState(writeParam === 'true');

  useEffect(() => {
    if (writeParam === 'true') {
      setIsWriting(true);
    }
  }, [writeParam]);

  const defaultReviews = [
    { id: 1, name: 'Alice Smith', rating: 5, comment: 'Amazing platform! I have saved so much money using KaroDeal. Highly recommended!', date: '2 days ago' },
    { id: 2, name: 'John Doe', rating: 4, comment: 'Great cashback offers, but sometimes takes a little while to track. Overall very satisfied.', date: '1 week ago' },
  ];

  useEffect(() => {
    // Check auth
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Load reviews
    const savedReviews = localStorage.getItem('karodeal_reviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(defaultReviews);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to submit a review.');
    if (rating === 0) return alert('Please select a star rating.');
    if (!comment.trim()) return alert('Please write a comment.');

    const newReview = {
      id: Date.now(),
      name: user.name || 'Anonymous User',
      rating,
      comment,
      date: 'Just now'
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('karodeal_reviews', JSON.stringify(updatedReviews));

    // Reset form
    setRating(0);
    setComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-extrabold text-black uppercase tracking-tight mb-4">
          Review Us
        </h3>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          We&apos;d love to hear about your experience with KaroDeal. Share your thoughts and help us improve!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Info or Write a Review Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm sticky top-28 overflow-hidden">
            {!isWriting ? (
              <div className="flex flex-col h-full">
                <div className="p-6 pb-8">
                  <h4 className="text-xl font-bold text-black mb-4">Reviews</h4>
                  <div className="text-[14px] text-neutral-600 space-y-4 leading-relaxed">
                    <p>
                      Lakhs of Indians visit karodeal every day and make the most of our best offers to get the best deals plus some extra Cashback, right into their bank account. KaroDeal reviews from these users show how our deals and offers have held up over the years.
                    </p>
                    <p>
                      These reviews are filled with appreciation from our users who are ecstatic about getting the best discount coupons and extra Cashback, only through KaroDeal.
                    </p>
                    <p>
                      Since its inception, KaroDeal has distributed crores in Cashback to its customers and has contributed significantly in GMV for online retailers to become the undisputed king of Cashback in India. We believe that Indians love to get more always!
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-3">
                  <span className="text-sm font-bold text-black text-center">Tell Us About Your Experience!</span>
                  <button
                    onClick={() => setIsWriting(true)}
                    className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Write a Review
                  </h2>
                  <button
                    onClick={() => setIsWriting(false)}
                    className="text-sm text-neutral-500 hover:text-black font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                {!user ? (
                  <div className="text-center py-6 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-sm lg:text-[15px] xl:text-base text-neutral-600 mb-4 font-medium">You need to be logged in to write a review.</p>
                    <Link href="/login" className="text-sm lg:text-[15px] xl:text-base inline-block bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-neutral-800 transition-colors">
                      Log in
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${(hoverRating || rating) >= star
                                  ? 'fill-black text-black'
                                  : 'text-neutral-300'
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comment" className="block text-sm font-semibold text-neutral-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                        placeholder="Tell us what you think..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      Publish Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Published Reviews Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-black mb-6">Recent Reviews</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-neutral-200">
              <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-bold text-black text-lg">{rev.name}</h5>
                      <span className="text-sm text-neutral-500 font-medium">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= rev.rating ? 'fill-black text-black' : 'text-neutral-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-700 leading-relaxed text-[15px]">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}
