"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { TourHero } from "@/components/features/tour/TourHero";
import { TourList } from "@/components/features/tour/TourList";
import { HomeAiChatbot } from "@/components/features/chat/HomeAiChatbot";
import type { ApiResponse, DashboardToursData, PublicTour } from "@/types/client-api";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState<PublicTour[]>([]);

  useEffect(() => {
    const loadTours = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/tours`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Khong tai duoc danh sach tour");
        }

        const payload = (await response.json()) as ApiResponse<DashboardToursData>;
        setTours(payload.data?.tourList || []);
      } catch (error) {
        console.error(error);
        setReloadToast("error", "Khong tai duoc danh sach tour cho trang chu.");
        showReloadToastIfAny();
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  const featuredTours = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const nextTours = tours.filter((tour) => {
      if (!keyword) return true;
      const category = tour.category?.name?.toLowerCase() || "";
      return tour.name.toLowerCase().includes(keyword) || category.includes(keyword) || (tour.information || "").toLowerCase().includes(keyword);
    });

    return nextTours.slice(0, 6);
  }, [tours, query]);

  return (
    <main className="pt-16 pb-24">
      <TourHero query={query} onQueryChange={setQuery} title="Tận hưởng Chuyến đi" subtitle="Khám phá những hành trình tuyệt vời nhất" />

      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Chuyến đi nổi bật</h2>
          <Link href="/tour" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            Xem tất cả
            <FaArrowRight />
          </Link>
        </div>

        <TourList tours={featuredTours} loading={loading} emptyMessage="Chưa có tour nổi bật." />
      </section>

      <HomeAiChatbot />
    </main>
  );
}
