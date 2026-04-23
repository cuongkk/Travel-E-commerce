"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

export interface TourCategory {
  id: string;
  name: string;
  children?: TourCategory[];
}

export interface TourCity {
  id: string;
  name: string;
}

export interface TourPayload {
  name: string;
  category: string;
  status: string;
  price: string;
  priceNew: string;
  stock: string;
  departureDate: string;
  endDate: string;
  information: string;
  locations: string[];
  schedules: { title: string; description: string }[];
  avatar: File | null;
  images: File[];
}

interface TourCreateProps {
  categories: TourCategory[];
  cities: TourCity[];
  onCreated: () => void;
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

export default function TourCreate({ categories, cities, onCreated, onCancel }: TourCreateProps) {
  const tinyMceApiKey = process.env.NEXT_PUBLIC_TINYMCE || "";

  const [form, setForm] = useState<TourPayload>({
    name: "",
    category: "",
    status: "active",
    price: "",
    priceNew: "",
    stock: "",
    departureDate: "",
    endDate: "",
    information: "",
    locations: [],
    schedules: [{ title: "", description: "" }],
    avatar: null,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarPondFiles, setAvatarPondFiles] = useState<File[]>([]);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([]);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [imagesPondFiles, setImagesPondFiles] = useState<File[]>([]);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const setValue = (key: keyof TourPayload, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = "Tên tour là bắt buộc";
    if (!form.category) nextErrors.category = "Danh mục là bắt buộc";
    if (!form.departureDate) nextErrors.departureDate = "Ngày khởi hành là bắt buộc";
    if (!form.endDate) nextErrors.endDate = "Ngày kết thúc là bắt buộc";

    const numbersToCheck: Array<keyof TourPayload> = ["price", "priceNew", "stock"];

    for (const key of numbersToCheck) {
      if (form[key] && Number(form[key]) < 0) {
        nextErrors[key] = "Giá trị phải lớn hơn hoặc bằng 0";
      }
    }

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

  useEffect(() => {
    if (!form.avatar) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.avatar);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.avatar]);

  useEffect(() => {
    if (form.images.length === 0) {
      setNewImagePreviewUrls([]);
      return;
    }

    const objectUrls = form.images.map((file) => URL.createObjectURL(file));
    setNewImagePreviewUrls(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.images]);

  const slidesPerView = 4;
  const lengthImages = (avatarPreviewUrl ? 1 : 0) + newImagePreviewUrls.length;
  const shouldLoop = (avatarPreviewUrl ? 1 : 0) + newImagePreviewUrls.length > slidesPerView;

  const handleGenerateAI = async () => {
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên tour trước khi dùng AI!");
      return;
    }

    try {
      setIsGeneratingAI(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "generate-description", subject: form.name, context: categoryOptions.find((item) => item.id === form.category)?.label || "" }),
      });
      const data = await res.json();
      if (!res.ok || data.code !== "success") throw new Error(data.message || "Lỗi khi gọi AI sinh mô tả");
      setValue("information", String(data.data || ""));
    } catch (e: any) {
      alert("Lỗi AI: " + e.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("category", form.category);
      formData.append("status", form.status);
      formData.append("price", form.price || "0");
      formData.append("priceNew", form.priceNew || "0");
      formData.append("stock", form.stock || "0");
      formData.append("departureDate", form.departureDate);
      formData.append("endDate", form.endDate);
      formData.append("information", form.information);
      formData.append("locations", JSON.stringify(form.locations));
      formData.append("schedules", JSON.stringify(form.schedules));

      if (form.avatar) {
        formData.append("avatar", form.avatar);
      }

      form.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tour/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || (data?.success !== true && data?.code !== "success")) {
        throw new Error(data.message || "Tạo tour thất bại");
      }

      onCreated();
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, submit: error.message || "Có lỗi xảy ra" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo tour mới</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {(avatarPreviewUrl || newImagePreviewUrls.length > 0) && (
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-medium text-gray-700 mb-3">Xem trước ảnh sẽ upload</p>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              loop={shouldLoop}
              loopAdditionalSlides={lengthImages}
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
                640: { slidesPerView: Math.min(2, lengthImages) },
                768: { slidesPerView: Math.min(3, lengthImages) },
              }}
            >
              {/* Avatar */}
              {avatarPreviewUrl && (
                <SwiperSlide>
                  <div className="relative rounded-lg overflow-hidden border border-blue-200 bg-blue-50">
                    <img src={avatarPreviewUrl} alt="preview-avatar" className="h-64 w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">Avatar</span>
                  </div>
                </SwiperSlide>
              )}

              {/* Images */}
              {newImagePreviewUrls.map((image, index) => (
                <SwiperSlide key={`${image}-${index}`}>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={image} alt={`preview-image-${index + 1}`} className="h-64 w-full object-cover" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
            <div className="avatar-pond">
              <FilePond
                files={avatarPondFiles}
                onupdatefiles={(items) => {
                  const nextFiles = items.map((item) => item.file as File);
                  setAvatarPondFiles(nextFiles);
                  setValue("avatar", nextFiles[0] ?? null);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh sách ảnh</label>
            <div className="avatar-pond">
              <FilePond
                files={imagesPondFiles}
                onupdatefiles={(items) => {
                  const nextFiles = items.map((item) => item.file as File);
                  setImagesPondFiles(nextFiles);
                  setValue("images", nextFiles);
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
              placeholder="Nhập tên tour"
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
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-gray-700">Thông tin tour</label>
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
            Hủy
          </button>
          <button type="submit" disabled={submitting} className="h-10 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? "Đang tạo..." : "Tạo tour"}
          </button>
        </div>
      </form>
    </div>
  );
}
