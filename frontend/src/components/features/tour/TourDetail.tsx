"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendar, FaCheckCircle, FaHeadset, FaUserFriends } from "react-icons/fa";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { PublicTour } from "@/types/client-api";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";
import { addTourToCart } from "@/utils/cart-client";
import { ReviewSection } from "@/components/features/review/ReviewSection";

const formatPrice = (value: number): string => `${Math.max(0, value).toLocaleString("vi-VN")}đ`;

type TourDetailProps = {
  tour: PublicTour;
};

type TourScheduleItem = {
  title: string;
  description: string;
};

const pickText = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const toScheduleItem = (value: Record<string, unknown>, index: number): TourScheduleItem => {
  const title = pickText(value, ["title", "name", "dayTitle", "label"]) || `Ngày ${index + 1}`;
  const description = pickText(value, ["description", "content", "detail", "summary"]) || "Đang cập nhật lịch trình chi tiết.";

  return { title, description };
};

const formatDate = (value: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN");
};

const normalizeDurationText = (value: string): string => {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bngay\b/gi, "ngày")
    .replace(/\bdem\b/gi, "đêm");
};

export function TourDetail({ tour }: TourDetailProps) {
  const router = useRouter();
  const [bookingLoading, setBookingLoading] = useState(false);

  const finalPrice = tour.priceNew > 0 ? tour.priceNew : tour.price;
  const gallery = [tour.avatar, ...tour.images].filter((image): image is string => Boolean(image));
  const schedules = (tour.schedules || []).map((item, index) => {
    if (typeof item !== "object" || item === null) {
      return toScheduleItem({}, index);
    }

    return toScheduleItem(item as Record<string, unknown>, index);
  });

  const departureLabel = formatDate(tour.departureDate);
  const endLabel = formatDate(tour.endDate);
  const dateRangeLabel = departureLabel && endLabel ? `${departureLabel} - ${endLabel}` : departureLabel || endLabel || "Đang cập nhật ngày khởi hành";

  const hasDiscount = tour.priceNew > 0 && tour.priceNew < tour.price;
  const locationLabel = tour.locationNames.length ? tour.locationNames.join(" - ") : "Đang cập nhật điểm đến";
  const itineraryLabel = schedules.length > 0 ? `${schedules.length} ngày` : "Đang cập nhật";

  const dayDurationFromDates = (() => {
    if (!tour.departureDate || !tour.endDate) return 0;

    const start = new Date(tour.departureDate);
    const end = new Date(tour.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    return diffDays > 0 ? diffDays : 0;
  })();

  const durationLabel =
    (tour.time?.trim() ? normalizeDurationText(tour.time) : "") || (dayDurationFromDates > 0 ? `${dayDurationFromDates} ngày` : schedules.length > 0 ? `${schedules.length} ngày` : "Đang cập nhật");

  const handleBookNow = async () => {
    if (bookingLoading || !tour.id) return;

    try {
      setBookingLoading(true);

      const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const authPayload = await authResponse.json();
      const isAuthenticated = authResponse.ok && authPayload?.success === true;

      if (!isAuthenticated) {
        const redirectPath = `/tour/${encodeURIComponent(tour.slug)}`;
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        return;
      }

      await addTourToCart(tour.id, 1);
      setReloadToast("success", "Đã thêm chuyến đi vào giỏ hàng.");
      showReloadToastIfAny();
      router.push("/cart");
    } catch {
      setReloadToast("error", "Không thể thêm chuyến đi vào giỏ hàng.");
      showReloadToastIfAny();
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main className="pt-20 pb-20 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
        <section className="lg:col-span-2 space-y-8">
          {gallery.length > 0 ? (
            <div className="rounded-xl overflow-hidden">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                loop={gallery.length > 1}
                speed={400}
                spaceBetween={12}
                navigation
                pagination={{ clickable: true }}
                autoplay={
                  gallery.length > 1
                    ? {
                      delay: 4000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                    : false
                }
              >
                {gallery.map((image, index) => (
                  <SwiperSlide key={`${image}-${index}`}>
                    <img src={image} loading="lazy" alt={`${tour.name} ${index + 1}`} className="w-full h-80 md:h-96 object-cover rounded-xl" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-container-low h-80 md:h-96 flex items-center justify-center text-on-surface-variant">Chưa có ảnh cho tour này</div>
          )}

          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{tour.category?.name || "Chuyến đi"}</p>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">{tour.name}</h1>
            <p className="text-on-surface-variant leading-relaxed">{tour.information || "Đang cập nhật mô tả chi tiết."}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Thời lượng</p>
              <p className="font-bold">{durationLabel}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Khởi hành</p>
              <p className="font-bold">{departureLabel || "Đang cập nhật"}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant">Số chỗ còn lại</p>
              <p className="font-bold">{tour.stock > 0 ? `${tour.stock} chỗ` : "Liên hệ"}</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold mb-10 tracking-tight">Lịch trình từng ngày</h2>

            {schedules.length > 0 ? (
              <div className="space-y-16 relative">
                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-linear-to-b from-primary via-primary-container to-transparent" />
                {schedules.map((schedule, index) => (
                  <div key={`${schedule.title}-${index}`} className="relative pl-16 group">
                    <div className="absolute left-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold z-10 border-4 border-surface shadow-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="bg-surface-container-low p-8 rounded-2xl hover:shadow-md transition-shadow">
                      <h3 className="text-2xl font-bold mb-4 text-on-surface">{schedule.title}</h3>
                      <p className="text-on-surface-variant leading-relaxed">{schedule.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-2xl p-8 text-on-surface-variant">Hiện chưa có lịch trình chi tiết cho tour này.</div>
            )}
          </div>

          {/* Evaluate & Review Section */}
          <ReviewSection itemId={tour.id as string} itemType="tour" />
        </section>

        <aside className="w-full lg:w-100">
          <div className="lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl p-8 shadow-[0_32px_64px_-16px_rgba(0,107,17,0.12)] border border-outline-variant/10">
              <div className="mb-8">
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Chỉ từ</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-on-surface tracking-tighter">{formatPrice(finalPrice)}</span>
                  <span className="text-on-surface-variant text-sm font-semibold">/ người</span>
                </div>
                {hasDiscount && <p className="mt-1 text-sm text-on-surface-variant line-through">{formatPrice(tour.price)}</p>}
              </div>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-primary" />
                    <span className="font-bold text-sm">{dateRangeLabel}</span>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <FaUserFriends className="text-primary" />
                    <span className="font-bold text-sm">{tour.stock > 0 ? `${tour.stock} chỗ còn trống` : "Hiện đã hết chỗ"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-primary text-xl" />
                  <span className="text-sm font-medium text-on-surface-variant">Thời lượng: {durationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-primary text-xl" />
                  <span className="text-sm font-medium text-on-surface-variant">Điểm đến: {locationLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-primary text-xl" />
                  <span className="text-sm font-medium text-on-surface-variant">Lịch trình: {itineraryLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBookNow}
                disabled={bookingLoading || tour.stock <= 0}
                className="primary-gradient-btn w-full py-5 bg-primary-gradient text-white rounded-full font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {bookingLoading ? "Đang thêm..." : "Đặt ngay"}
              </button>
              <p className="text-center text-xs text-on-surface-variant mt-4 font-medium">
                {tour.stock > 0 ? `Còn ${tour.stock} chỗ, vui lòng đặt sớm để giữ giá tốt.` : "Vui lòng liên hệ để được tư vấn lịch khởi hành khác."}
              </p>
            </div>
            <div className="mt-6 p-6 bg-tertiary-container/10 border border-tertiary/10 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
                <FaHeadset className="text-tertiary" />
              </div>
              <div>
                <p className="font-bold text-sm">Bạn cần giúp đỡ?</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
