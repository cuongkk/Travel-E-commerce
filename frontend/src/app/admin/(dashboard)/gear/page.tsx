"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPen, FaTrash } from "react-icons/fa6";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

type GearItem = {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  price: number;
  status: "active" | "inactive";
  image: string;
};

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

const defaultForm: GearForm = {
  name: "",
  category: "",
  subtitle: "",
  description: "",
  price: "",
  image: "",
  badge: "",
  status: "active",
};

export default function GearAdminPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [rows, setRows] = useState<GearItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<GearForm>(defaultForm);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchFailed(false);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/list`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Không tải được danh sách gear");
      }

      const list = (data?.data?.gearList || []).map((item: any) => ({
        id: item._id || item.id,
        name: item.name || "",
        category: item.category || "",
        subtitle: item.subtitle || "",
        price: Number(item.price || 0),
        status: item.status || "inactive",
        image: item.image || "",
      }));

      setRows(list);
    } catch (error: any) {
      setFetchFailed(true);
      setReloadToast("error", error.message || "Đã có lỗi xảy ra");
      showReloadToastIfAny();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isLogin) {
      router.push("/admin/login");
      return;
    }

    fetchData();
  }, [isAuthLoaded, isLogin]);

  const filteredRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return rows.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (!kw) return true;
      return [item.name, item.category, item.subtitle].join(" ").toLowerCase().includes(kw);
    });
  }, [rows, keyword, statusFilter]);

  const submitCreate = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/create`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok || data?.success !== true) {
      setReloadToast("error", data?.message || "Tạo gear thất bại");
      showReloadToastIfAny();
      return;
    }

    setReloadToast("success", data?.message || "Tạo gear thành công");
    showReloadToastIfAny();
    setForm(defaultForm);
    setShowCreate(false);
    await fetchData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn gear "${name}" không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Xóa gear thất bại");
      }

      setReloadToast("success", "Đã xóa gear thành công");
      showReloadToastIfAny();
      await fetchData();
    } catch (error: any) {
      setReloadToast("error", error.message || "Xóa thất bại");
      showReloadToastIfAny();
    }
  };

  const formatMoney = (value: number) => `${Math.max(0, value).toLocaleString("vi-VN")}đ`;

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] p-4 md:p-8 space-y-4 md:space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý gear</h1>

      <div className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên, danh mục..."
            className="h-10 w-full md:w-72 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Dừng hoạt động</option>
          </select>

          <button type="button" onClick={() => setShowCreate((prev) => !prev)} className="h-10 px-4 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
            {showCreate ? "Đóng form" : "Thêm mới"}
          </button>
          
          <button type="button" onClick={() => router.push('/admin/gear/trash')} className="h-10 px-4 flex items-center gap-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
            <FaTrash /> Thùng rác
          </button>
        </div>

        {showCreate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl border border-gray-200 p-4">
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Tên gear"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="Danh mục"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.subtitle}
              onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
              placeholder="Phụ đề"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.badge}
              onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
              placeholder="Badge"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <input
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              placeholder="Giá"
              type="number"
              min={0}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            />
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as "active" | "inactive" }))}
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Dừng hoạt động</option>
            </select>
            <input
              value={form.image}
              onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
              placeholder="URL ảnh"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm md:col-span-2"
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Mô tả"
              className="min-h-24 px-3 py-2 rounded-lg border border-gray-200 text-sm md:col-span-2"
            />
            <div className="md:col-span-2">
              <button type="button" onClick={submitCreate} className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                Lưu gear
              </button>
            </div>
          </div>
        )}

        {loading && <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>}

        {!loading && fetchFailed && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-500">Không tải được dữ liệu gear.</p>
            <button type="button" onClick={fetchData} className="mt-3 h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !fetchFailed && (
          <div className="overflow-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Gear</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Danh mục</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Giá</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image || "/admin/assets/images/placeholder.png"} alt={item.name} className="w-14 h-10 rounded object-cover border border-gray-100" />
                        <div>
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.category}</td>
                    <td className="px-4 py-3 text-gray-700">{formatMoney(item.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.status === "active" ? "Hoạt động" : "Dừng hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => router.push(`/admin/gear/${item.id}`)} className="w-8 h-8 rounded-md bg-amber-100 text-amber-600 hover:bg-amber-200 flex items-center justify-center">
                          <FaPen />
                        </button>
                        <button type="button" onClick={() => handleDelete(item.id, item.name)} className="w-8 h-8 rounded-md bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                      Không có gear phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
