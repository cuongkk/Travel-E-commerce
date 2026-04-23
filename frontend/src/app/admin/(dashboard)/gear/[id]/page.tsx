"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

type GearForm = {
  name: string;
  category: string;
  subtitle: string;
  description: string;
  price: string;
  image: string;
  badge: string;
  status: "active" | "inactive";
};

const mapForm = (item: any): GearForm => ({
  name: item?.name || "",
  category: item?.category || "",
  subtitle: item?.subtitle || "",
  description: item?.description || "",
  price: String(item?.price || 0),
  image: item?.image || "",
  badge: item?.badge || "",
  status: item?.status === "inactive" ? "inactive" : "active",
});

export default function GearEditPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [form, setForm] = useState<GearForm | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setFetchFailed(false);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/edit/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Không tải được chi tiết gear");
      }

      setForm(mapForm(data?.data?.gearDetail));
    } catch (error: any) {
      setFetchFailed(true);
      setReloadToast("error", error.message || "Đã có lỗi xảy ra");
      showReloadToastIfAny();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isLogin) {
      router.push("/admin/login");
      return;
    }

    fetchDetail();
  }, [isAuthLoaded, isLogin, id]);

  const submitEdit = async () => {
    if (!id || !form) return;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/edit/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok || data?.success !== true) {
      setReloadToast("error", data?.message || "Cập nhật gear thất bại");
      showReloadToastIfAny();
      return;
    }

    setReloadToast("success", data?.message || "Cập nhật gear thành công");
    router.push("/admin/gear");
  };

  const handleGenerateAIGear = async () => {
    if (!form?.name.trim() || !form?.category.trim()) {
      setReloadToast("error", "Vui lòng nhập tên gear và danh mục trước khi dùng AI");
      showReloadToastIfAny();
      return;
    }

    try {
      setIsGeneratingAI(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "generate-description", subject: form.name, context: form.category }),
      });
      const data = await res.json();

      if (!res.ok || data?.code !== "success") {
        throw new Error(data?.message || "Lỗi khi gọi AI sinh mô tả");
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              description: String(data?.data || prev.description),
            }
          : prev,
      );
    } catch (error: any) {
      setReloadToast("error", error.message || "Không thể sinh mô tả gear bằng AI");
      showReloadToastIfAny();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] p-4 md:p-8 space-y-4 md:space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa gear</h1>

      {loading && <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 text-sm text-gray-500">Đang tải dữ liệu...</div>}

      {!loading && fetchFailed && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm text-red-500 mb-3">Không thể tải dữ liệu gear.</p>
          <button type="button" onClick={fetchDetail} className="h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !fetchFailed && form && (
        <div className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-4 md:p-6 space-y-3">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleGenerateAIGear}
              disabled={isGeneratingAI}
              className="h-9 px-3 rounded-lg text-sm font-semibold bg-linear-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 disabled:opacity-60"
            >
              {isGeneratingAI ? "Đang sinh mô tả..." : "AI sinh mô tả"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
              placeholder="Tên gear"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.category}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, category: event.target.value } : prev))}
              placeholder="Danh mục"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.subtitle}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, subtitle: event.target.value } : prev))}
              placeholder="Phụ đề"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.badge}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, badge: event.target.value } : prev))}
              placeholder="Badge"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.price}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, price: event.target.value } : prev))}
              placeholder="Giá"
              type="number"
              min={0}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, status: event.target.value as "active" | "inactive" } : prev))}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Dừng hoạt động</option>
            </select>
          </div>

          <input
            value={form.image}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, image: event.target.value } : prev))}
            placeholder="URL ảnh"
            className="h-10 w-full px-3 rounded-lg border border-gray-200 text-sm"
          />

          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, description: event.target.value } : prev))}
            placeholder="Mô tả"
            className="min-h-24 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={submitEdit} className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Lưu thay đổi
            </button>
            <button type="button" onClick={() => router.push("/admin/gear")} className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
