"use client";

import React, { useMemo, useState } from "react";

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

interface CategoryCreateProps {
  categoryOptions: CategoryNode[];
  onCreated: () => Promise<void> | void;
  onCancel: () => void;
}

const flattenOptions = (categories: CategoryNode[], depth = 0): Array<{ id: string; label: string }> => {
  const output: Array<{ id: string; label: string }> = [];
  for (const category of categories) {
    output.push({ id: category.id, label: `${"— ".repeat(depth)}${category.name}` });
    if (category.children?.length) {
      output.push(...flattenOptions(category.children, depth + 1));
    }
  }
  return output;
};

export default function CategoryCreate({ categoryOptions, onCreated, onCancel }: CategoryCreateProps) {
  const [form, setForm] = useState({
    name: "",
    parent: "",
    position: "",
    status: "active",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const options = useMemo(() => flattenOptions(categoryOptions), [categoryOptions]);

  const setValue = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) {
      next.name = "Tên danh mục là bắt buộc";
    }
    if (form.position && Number(form.position) < 0) {
      next.position = "Vị trí phải lớn hơn hoặc bằng 0";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        parent: form.parent,
        position: form.position || "",
        status: form.status,
        description: form.description.trim(),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Tạo danh mục thất bại");
      }

      await onCreated();
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, submit: error.message || "Đã có lỗi xảy ra" }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!form.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Vui lòng nhập tên danh mục trước khi dùng AI" }));
      return;
    }

    const parentLabel = options.find((item) => item.id === form.parent)?.label.replace(/^—\s*/g, "") || "";

    try {
      setIsGeneratingAI(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate-description", subject: form.name.trim(), context: parentLabel || undefined }),
      });
      const data = await response.json();

      if (!response.ok || data?.code !== "success") {
        throw new Error(data?.message || "Không thể sinh mô tả bằng AI");
      }

      setForm((prev) => ({ ...prev, description: String(data?.data || "") }));
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, submit: error.message || "Không thể sinh mô tả bằng AI" }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo danh mục</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setValue("name", event.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
            placeholder="Nhập tên danh mục"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha</label>
            <select value={form.parent} onChange={(event) => setValue("parent", event.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500">
              <option value="">-- Chọn danh mục --</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
            <input
              type="number"
              step="0.1"
              value={form.position}
              onChange={(event) => setValue("position", event.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
              placeholder="Nhập vị trí"
            />
            {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select value={form.status} onChange={(event) => setValue("status", event.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500">
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-gray-700">Mô tả danh mục</label>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="h-8 px-3 rounded-lg text-xs font-semibold bg-linear-to-r from-sky-500 to-cyan-600 text-white hover:opacity-90 disabled:opacity-60"
            >
              {isGeneratingAI ? "Đang sinh mô tả..." : "AI sinh mô tả"}
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={(event) => setValue("description", event.target.value)}
            className="w-full min-h-24 px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 text-sm"
            placeholder="Nhập mô tả danh mục hoặc dùng AI gợi ý"
          />
        </div>

        {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={onCancel} className="h-10 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
            Hủy
          </button>
          <button type="submit" disabled={submitting} className="h-10 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? "Đang tạo..." : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
