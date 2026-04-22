"use client";

import { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";
import { API_BASE_URL } from "@/utils/api-client";

type Review = {
  _id: string;
  rating: number;
  content: string;
  createdAt: string;
  accountId: {
    fullName: string;
    avatar: string;
  };
};

type ReviewSectionProps = {
  itemId: string;
  itemType: "tour" | "gear";
};

export const ReviewSection = ({ itemId, itemType }: ReviewSectionProps) => {
  const { isLogin, userInfo } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States cho form đánh giá
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/review-client/list?itemId=${itemId}&itemType=${itemType}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [itemId, itemType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      setErrorMsg("Vui lòng đăng nhập để đánh giá.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/review-client/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemId,
          itemType,
          rating,
          content: content.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gửi đánh giá thất bại.");
      }

      setReloadToast("success", "Cảm ơn bạn đã gửi đánh giá.");
      showReloadToastIfAny();
      setContent("");
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="mt-12 w-full">
      <h2 className="text-3xl font-extrabold mb-8 tracking-tight">Đánh giá & Bình luận</h2>
      
      <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-6 border-b border-outline-variant/15 pb-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="text-center z-10 shrink-0">
                <span className="text-6xl font-black text-on-surface leading-none">{avgRating}</span>
                <div className="flex items-center justify-center gap-1 mt-2 text-primary">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <FaStar key={i} className={`text-lg ${i <= Number(avgRating) ? "" : "text-outline-variant"}`} />
                    ))}
                </div>
                <span className="text-sm font-medium text-on-surface-variant mt-2 block">{reviews.length} đánh giá</span>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-4 z-10 hidden sm:block">
                <div className="flex flex-col">
                    <label className="text-sm font-bold text-on-surface mb-2">Bạn cảm thấy trải nghiệm như thế nào?</label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            >
                                {star <= (hoverRating || rating) ? (
                                    <FaStar className="text-2xl text-primary drop-shadow-sm" />
                                ) : (
                                    <FaRegStar className="text-2xl text-outline-variant hover:text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Hãy chia sẻ cảm nhận của bạn về chuyến đi..."
                        className="flex-1 bg-white border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-primary text-white font-bold px-6 rounded-xl hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 whitespace-nowrap"
                    >
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </div>
                {errorMsg && <p className="text-red-500 text-xs font-medium">{errorMsg}</p>}
                {!isLogin && !errorMsg && <p className="text-on-surface-variant text-xs italic">* Bạn cần hoàn thành dịch vụ này để được đánh giá.</p>}
            </form>
        </div>

        {/* Form mobile view */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 z-10 sm:hidden border-b border-outline-variant/15 pb-8">
            <div className="flex flex-col">
                <label className="text-sm font-bold text-on-surface mb-2">Bạn cảm thấy trải nghiệm như thế nào?</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            type="button"
                            key={star}
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            {star <= (hoverRating || rating) ? (
                                <FaStar className="text-2xl text-primary drop-shadow-sm" />
                            ) : (
                                <FaRegStar className="text-2xl text-outline-variant hover:text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Hãy chia sẻ cảm nhận của bạn về chuyến đi..."
                    className="w-full bg-white border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm min-h-[100px]"
                />
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
            </div>
            {errorMsg && <p className="text-red-500 text-xs font-medium">{errorMsg}</p>}
            {!isLogin && !errorMsg && <p className="text-on-surface-variant text-xs italic">* Bạn cần hoàn thành dịch vụ này để được đánh giá.</p>}
        </form>

        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-sm text-on-surface-variant py-8">Đang tải đánh giá...</p>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="flex gap-4">
                <img 
                    src={review.accountId?.avatar || "/client/images/avatar-default.png"} 
                    alt={review.accountId?.fullName} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
                <div className="flex-1 bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                        <h4 className="font-bold text-on-surface text-sm">{review.accountId?.fullName || "Khách hàng"}</h4>
                        <span className="text-xs text-on-surface-variant">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex gap-0.5 text-primary">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <FaStar key={i} className={`text-xs ${i <= review.rating ? "" : "text-outline-variant"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-on-surface text-sm leading-relaxed">{review.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-outline-variant/30">
              <FaStar className="text-4xl text-outline-variant/30 mx-auto mb-3" />
              <p className="font-bold text-on-surface mb-1">Chưa có đánh giá nào</p>
              <p className="text-sm text-on-surface-variant">Hãy là người đầu tiên chia sẻ cảm nhận về trải nghiệm này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
