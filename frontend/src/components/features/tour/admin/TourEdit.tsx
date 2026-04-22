"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { TourCategory, TourCity } from "./TourCreate";
import { Editor } from "@tinymce/tinymce-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

export interface TourDetail {
  id: string;
  name: string;
  category: string;
  status: "active" | "inactive";
  avatar: string;
  images: string[];
  price: number;
  priceNew: number;
  stock: number;
  locations: string[];
  departureDate: string;
  endDate?: string;
  information: string;
  schedules: { title: string; description: string }[];
}

interface TourEditProps {
  tour: TourDetail;
  categories: TourCategory[];
  cities: TourCity[];
  onSubmit: (payload: FormData) => Promise<void>;
  onCancel: () => void;
}

const flattenCategories = (categories: TourCategory[], depth = 0): Array<{ id: string; label: string }> => {
  const rows: Array<{ id: string; label: string }> = [];
  for (const category of categories) {
    rows.push({ id: category.id, label: `${"— ".repeat(depth)}${category.name}` });
    if (category.children?.length) {
      rows.push(...flattenCategories(category.children, depth + 1));
    }
  }
  return rows;
};

export default function TourEdit({ tour, categories, cities, onSubmit, onCancel }: TourEditProps) {
  const tinyMceApiKey = process.env.NEXT_PUBLIC_TINYMCE || "";

  const [form, setForm] = useState({
    name: tour.name,
    category: tour.category,
    status: tour.status,
    price: String(tour.price || 0),
    priceNew: String(tour.priceNew || 0),
    stock: String(tour.stock || 0),
    departureDate: tour.departureDate || "",
    endDate: tour.endDate || "",
    information: tour.information || "",
    locations: tour.locations || [],
    schedules: tour.schedules?.length ? tour.schedules : [{ title: "", description: "" }],
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imagesFiles, setImagesFiles] = useState<File[]>([]);
  const [avatarPondFiles, setAvatarPondFiles] = useState<File[]>([]);
  const [imagesPondFiles, setImagesPondFiles] = useState<File[]>([]);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  useEffect(() => {
    if (imagesFiles.length === 0) {
      setNewImagePreviewUrls([]);
      return;
    }

    const objectUrls = imagesFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagesFiles]);

  const galleryImages = useMemo(
    () => [avatarPreviewUrl || tour.avatar, ...(tour.images || []), ...newImagePreviewUrls].filter(Boolean),
    [avatarPreviewUrl, newImagePreviewUrls, tour.avatar, tour.images],
  );

  useEffect(() => {
    if (galleryImages.length === 0) return;

    let lightbox: any;

    (async () => {
      const PhotoSwipeLightbox = (await import("photoswipe/lightbox")).default;
      lightbox = new PhotoSwipeLightbox({
        gallery: "#tour-image-gallery",
        children: "a",
        pswpModule: () => import("photoswipe"),
      });
      lightbox.init();
    })();

    return () => {
      if (lightbox) {
        lightbox.destroy();
      }
    };
  }, [galleryImages]);

  const setValue = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const slidesPerView = 4;
  const shouldLoop = galleryImages.length > slidesPerView;

  const handleGenerateAI = async () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập Tên tour trước khi dùng AI sinh lịch trình!");
      return;
    }
    
    let time = "3 ngày 2 đêm";
    if (form.departureDate && form.endDate) {
      const start = new Date(form.departureDate);
      const end = new Date(form.endDate);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) time = `${diffDays} ngày ${diffDays - 1 > 0 ? diffDays - 1 : 0} đêm`;
    }

    try {
      setIsGeneratingAI(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "tour-schedule", name: form.name, time }),
      });
      const data = await res.json();
      if (!res.ok || data.code !== "success") throw new Error(data.message || "Lỗi khi gọi AI API");
      if (Array.isArray(data.data) && data.data.length > 0) {
        setValue("schedules", data.data);
      } else {
        alert("Kết quả trả về không hợp lệ, vui lòng thử lại.");
      }
    } catch (e: any) {
      alert("Lỗi AI: " + e.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Tên tour là bắt buộc";
    if (!form.category) nextErrors.category = "Danh mục là bắt buộc";
    if (!form.departureDate) nextErrors.departureDate = "Ngày khởi hành là bắt buộc";
    if (!form.endDate) nextErrors.endDate = "Ngày kết thúc là bắt buộc";

    if (form.departureDate && form.endDate && new Date(form.endDate) < new Date(form.departureDate)) {
      nextErrors.endDate = "Ngày kết thúc phải lớn hơn hoặc bằng ngày khởi hành";
    }

    if (form.locations.length === 0) {
      nextErrors.locations = "Cần chọn ít nhất một địa điểm";
    }

    const invalidSchedule = form.schedules.some((schedule) => schedule.title.trim() === "" || schedule.description.trim() === "");
    if (invalidSchedule) {
      nextErrors.schedules = "Mỗi lịch trình cần có tiêu đề và mô tả";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("category", form.category);
      payload.append("status", form.status);
      payload.append("price", form.price || "0");
      payload.append("priceNew", form.priceNew || "0");
      payload.append("stock", form.stock || "0");
      payload.append("departureDate", form.departureDate);
      payload.append("endDate", form.endDate || "");
      payload.append("information", form.information);
      payload.append("locations", JSON.stringify(form.locations));
      payload.append("schedules", JSON.stringify(form.schedules));

      if (avatarFile) payload.append("avatar", avatarFile);
      imagesFiles.forEach((file) => payload.append("images", file));

      await onSubmit(payload);
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, submit: error.message || "Cập nhật thất bại" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {galleryImages.length > 0 && (
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-700 mb-3">Ảnh hiện tại của tour</p>
            <div id="tour-image-gallery">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                loop={shouldLoop}
                loopAdditionalSlides={galleryImages.length}
                speed={600}
                spaceBetween={12}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  640: { slidesPerView: Math.min(2, galleryImages.length) },
                  768: { slidesPerView: Math.min(3, galleryImages.length) },
                }}
                grabCursor={true}
                className="rounded-lg overflow-hidden"
              >
                {galleryImages.map((image, index) => (
                  <SwiperSlide key={`${image}-${index}`}>
                    <a href={image} target="_blank" rel="noreferrer" data-pswp-width="1600" data-pswp-height="1067" className="block">
                      <img src={image} alt={`${tour.name}-${index}`} className="h-64 w-full object-cover rounded-lg" />
                    </a>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện mới</label>
            <div className="avatar-pond">
              <FilePond
                files={avatarPondFiles}
                onupdatefiles={(items) => {
                  const nextFiles = items.map((item) => item.file as File);
                  setAvatarPondFiles(nextFiles);
                  setAvatarFile(nextFiles[0] ?? null);
                }}
                allowMultiple={false}
                maxFiles={1}
                acceptedFileTypes={["image/*"]}
                name="avatar"
                labelIdle='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" style="display:block;margin:0 auto 8px"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16v-8m-4 4 4-4 4 4M6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 17.5 6h-2l-1.5-2h-4L8.5 6h-2A1.5 1.5 0 0 0 5 7.5v11A1.5 1.5 0 0 0 6.5 20Z"/></svg>Kéo thả ảnh hoặc <span class="filepond--label-action">chọn file</span>'
                imagePreviewHeight={256}
                styleLoadIndicatorPosition="center bottom"
                styleProgressIndicatorPosition="right bottom"
                styleButtonRemoveItemPosition="left bottom"
                styleButtonProcessItemPosition="right bottom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách ảnh mới</label>
            <div className="avatar-pond">
              <FilePond
                files={imagesPondFiles}
                onupdatefiles={(items) => {
                  const nextFiles = items.map((item) => item.file as File);
                  setImagesPondFiles(nextFiles);
                  setImagesFiles(nextFiles);
                }}
                allowMultiple={true}
                maxFiles={10}
                acceptedFileTypes={["image/*"]}
                name="images"
                labelIdle='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" style="display:block;margin:0 auto 8px"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16v-8m-4 4 4-4 4 4M6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 17.5 6h-2l-1.5-2h-4L8.5 6h-2A1.5 1.5 0 0 0 5 7.5v11A1.5 1.5 0 0 0 6.5 20Z"/></svg>Kéo thả ảnh hoặc <span class="filepond--label-action">chọn file</span>'
                imagePreviewHeight={256}
                styleLoadIndicatorPosition="center bottom"
                styleProgressIndicatorPosition="right bottom"
                styleButtonRemoveItemPosition="left bottom"
                styleButtonProcessItemPosition="right bottom"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên tour *</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setValue("name", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
            <select
              value={form.category}
              onChange={(event) => setValue("category", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            >
              <option value="">-- Chọn danh mục --</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select value={form.status} onChange={(event) => setValue("status", event.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500">
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => setValue("price", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
            <input
              type="number"
              min={0}
              value={form.priceNew}
              onChange={(event) => setValue("priceNew", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng còn lại</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(event) => setValue("stock", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày khởi hành *</label>
            <input
              type="date"
              value={form.departureDate}
              onChange={(event) => setValue("departureDate", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            />
            {errors.departureDate && <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => setValue("endDate", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            />
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm có tour *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
            {cities.map((city) => (
              <label key={city.id} className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.locations.includes(city.id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setValue("locations", [...form.locations, city.id]);
                    } else {
                      setValue(
                        "locations",
                        form.locations.filter((id) => id !== city.id),
                      );
                    }
                  }}
                  className="w-4 h-4"
                />
                {city.name}
              </label>
            ))}
          </div>
          {errors.locations && <p className="text-xs text-red-500 mt-1">{errors.locations}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin tour</label>
          <Editor
            apiKey={tinyMceApiKey}
            value={form.information}
            onEditorChange={(content) => setValue("information", content)}
            init={{
              height: 280,
              menubar: false,
              promotion: false,
              plugins: ["lists", "link", "autolink", "preview", "searchreplace", "wordcount"],
              toolbar: "undo redo | blocks | bold italic underline | bullist numlist | link | removeformat | preview",
              content_style: "body { font-family: Lexend, sans-serif; font-size: 14px; }",
            }}
          />
        </div>

        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-2">
            <label className="block text-sm font-medium text-gray-700">Lịch trình tour *</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="text-sm font-semibold rounded-lg px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isGeneratingAI ? "Đang sinh..." : "✨ Sinh tự động AI"}
              </button>
              <button 
                type="button" 
                onClick={() => setValue("schedules", [...form.schedules, { title: "", description: "" }])} 
                className="text-sm font-medium rounded-lg border border-blue-200 px-3 py-1.5 text-blue-600 hover:bg-blue-50"
              >
                + Thêm lịch trình
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {form.schedules.map((schedule, index) => (
              <div key={index} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={schedule.title}
                    onChange={(event) => {
                      const next = [...form.schedules];
                      next[index] = { ...next[index], title: event.target.value };
                      setValue("schedules", next);
                    }}
                    placeholder="Tiêu đề"
                    className="h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (form.schedules.length === 1) return;
                      setValue(
                        "schedules",
                        form.schedules.filter((_, itemIndex) => itemIndex !== index),
                      );
                    }}
                    className="h-10 px-3 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50"
                  >
                    Xóa lịch trình
                  </button>
                </div>

                <textarea
                  value={schedule.description}
                  onChange={(event) => {
                    const next = [...form.schedules];
                    next[index] = { ...next[index], description: event.target.value };
                    setValue("schedules", next);
                  }}
                  placeholder="Mô tả lịch trình"
                  rows={3}
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 bg-white"
                />
              </div>
            ))}
          </div>
          {errors.schedules && <p className="text-xs text-red-500 mt-1">{errors.schedules}</p>}
        </div>

        {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={onCancel} className="h-10 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
            Quay lại
          </button>
          <button type="submit" disabled={submitting} className="h-10 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? "Đang cập nhật..." : "Cập nhật tour"}
          </button>
        </div>
      </form>
    </div>
  );
}
