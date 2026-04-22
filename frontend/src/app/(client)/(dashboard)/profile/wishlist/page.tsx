"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHeart, FaChevronLeft } from "react-icons/fa6";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";
import { TourCard } from "@/components/features/tour/TourCard";
import type { PublicTour } from "@/types/client-api";

export default function WishlistPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<PublicTour[]>([]);

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wishlist`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.status === 401) {
        router.push("/login?redirect=/profile/wishlist");
        return;
      }

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Không tải được danh sách yêu thích");
      }

      setWishlist(data?.data?.wishlist || []);
    } catch (error: any) {
      setReloadToast("error", error.message || "Đã có lỗi xảy ra");
      showReloadToastIfAny();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isLogin) {
      router.push("/login?redirect=/profile/wishlist");
      return;
    }

    fetchData();
  }, [isAuthLoaded, isLogin]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-32">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6">Đang tải danh sách yêu thích...</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-28 md:py-32">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-on-surface-variant hover:text-primary transition-colors">
              <FaChevronLeft className="text-xl" />
            </Link>
            <h1 className="text-3xl font-extrabold text-on-surface font-headline flex items-center gap-3">
              Danh sách yêu thích
              <FaHeart className="text-red-500" />
            </h1>
          </div>
          <p className="text-on-surface-variant ml-8 text-sm md:text-base">Các chuyến đi bạn đã quan tâm và lưu lại.</p>
        </div>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-12 text-center shadow-sm">
          <FaHeart className="text-4xl text-outline-variant/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có tour nào</h3>
          <p className="text-on-surface-variant mb-6">Bạn chưa lưu bất kỳ tour du lịch nào vào danh sách yêu thích.</p>
          <Link href="/tour" className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-bold text-on-primary hover:opacity-90 transition-opacity">
            Khám phá các Tour ngay
          </Link>
        </div>
      )}
    </section>
  );
}
