"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";
import { Editor } from "@tinymce/tinymce-react";

type JournalForm = {
  title: string;
  summary: string;
  tag: string;
  author: string;
  dateLabel: string;
  image: string;
  avatar: string;
  trendingScore: string;
  status: "active" | "inactive";
};

const mapForm = (item: any): JournalForm => ({
  title: item?.title || "",
  summary: item?.summary || "",
  tag: item?.tag || "",
  author: item?.author || "",
  dateLabel: item?.dateLabel || "",
  image: item?.image || "",
  avatar: item?.avatar || "",
  trendingScore: String(item?.trendingScore || 0),
  status: item?.status === "inactive" ? "inactive" : "active",
});

export default function JournalEditPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [form, setForm] = useState<JournalForm | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const tinyMceApiKey = process.env.NEXT_PUBLIC_TINYMCE || "";

  const fetchDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setFetchFailed(false);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journal/edit/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Không tải được chi tiết journal");
      }

      setForm(mapForm(data?.data?.journalDetail));
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journal/edit/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok || data?.success !== true) {
      setReloadToast("error", data?.message || "Cập nhật journal thất bại");
      showReloadToastIfAny();
      return;
    }

    setReloadToast("success", data?.message || "Cập nhật journal thành công");
    router.push("/admin/journal");
  };

  const handleGenerateAI = async () => {
    if (!form?.title.trim() || !form?.tag.trim()) {
      alert("Vui lòng nhập tiêu đề và tag trước khi dùng AI!");
      return;
    }

    try {
      setIsGeneratingAI(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "generate-description", subject: form.title, context: form.tag }),
      });
      const data = await res.json();

      if (!res.ok || data.code !== "success") {
        throw new Error(data.message || "Lỗi khi gọi AI sinh mô tả");
      }

      if (data.data) {
        setForm((prev) => (prev ? { ...prev, summary: data.data } : prev));
      }
    } catch (e: any) {
      alert("Lỗi AI: " + e.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] p-4 md:p-8 space-y-4 md:space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa journal</h1>

      {loading && <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 text-sm text-gray-500">Đang tải dữ liệu...</div>}

      {!loading && fetchFailed && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm text-red-500 mb-3">Không thể tải dữ liệu journal.</p>
          <button type="button" onClick={fetchDetail} className="h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
            Thử lại
          </button>
        </div>
      )}

      {!loading && !fetchFailed && form && (
        <div className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-4 md:p-6 space-y-3">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
            placeholder="Tiêu đề"
            className="h-10 w-full px-3 rounded-lg border border-gray-200 text-sm"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Nội dung bài viết (Tóm tắt)</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="text-sm font-semibold rounded-lg px-3 py-1.5 bg-linear-to-r from-purple-500 to-indigo-600 text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isGeneratingAI ? "Đang sinh mô tả..." : "AI sinh mô tả"}
              </button>
            </div>
            <Editor
              apiKey={tinyMceApiKey}
              value={form.summary}
              onEditorChange={(content) => setForm((prev) => (prev ? { ...prev, summary: content } : prev))}
              init={{
                height: 350,
                menubar: false,
                promotion: false,
                plugins: ["lists", "link", "autolink", "preview", "searchreplace", "wordcount"],
                toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link | removeformat | preview",
                content_style: "body { font-family: Lexend, sans-serif; font-size: 14px; }",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={form.tag}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, tag: event.target.value } : prev))}
              placeholder="Tag"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.author}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, author: event.target.value } : prev))}
              placeholder="Tác giả"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.dateLabel}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, dateLabel: event.target.value } : prev))}
              placeholder="Ngày hiển thị"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.trendingScore}
              onChange={(event) => setForm((prev) => (prev ? { ...prev, trendingScore: event.target.value } : prev))}
              placeholder="Điểm trending"
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
            placeholder="URL ảnh bài viết"
            className="h-10 w-full px-3 rounded-lg border border-gray-200 text-sm"
          />
          <input
            value={form.avatar}
            onChange={(event) => setForm((prev) => (prev ? { ...prev, avatar: event.target.value } : prev))}
            placeholder="URL avatar tác giả"
            className="h-10 w-full px-3 rounded-lg border border-gray-200 text-sm"
          />

          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={submitEdit} className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Lưu thay đổi
            </button>
            <button type="button" onClick={() => router.push("/admin/journal")} className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
