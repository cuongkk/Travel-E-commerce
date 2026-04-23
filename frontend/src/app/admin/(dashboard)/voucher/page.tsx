"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

export default function VoucherAdminPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [keyword, setKeyword] = useState("");

  const defaultForm = {
    code: "",
    name: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    maxUsage: "",
    expiresAt: "",
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/list`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Lỗi tải dữ liệu");
      setRows(data.data.voucherList || []);
    } catch (error: any) {
      setReloadToast("error", error.message);
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
    const kw = keyword.toLowerCase().trim();
    if (!kw) return rows;
    return rows.filter((r) => r.code?.toLowerCase().includes(kw) || r.name?.toLowerCase().includes(kw));
  }, [rows, keyword]);

  const submitCreate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);

      setReloadToast("success", data.message);
      showReloadToastIfAny();
      setForm(defaultForm);
      setShowCreate(false);
      fetchData();
    } catch (err: any) {
      setReloadToast("error", err.message);
      showReloadToastIfAny();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/edit/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);

      fetchData();
    } catch (err: any) {
      setReloadToast("error", err.message);
      showReloadToastIfAny();
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa mã giảm giá ${code}?`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);

      setReloadToast("success", data.message);
      showReloadToastIfAny();
      fetchData();
    } catch (err: any) {
      setReloadToast("error", err.message);
      showReloadToastIfAny();
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý mã giảm giá</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <div className="flex gap-4">
          <input className="border px-4 py-2 rounded-lg flex-1 outline-none focus:border-blue-500" placeholder="Tìm theo mã hoặc tên..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Đóng" : "Tạo mã mới"}
          </button>
          <button
            onClick={() => router.push("/admin/voucher/trash")}
            className="px-4 flex items-center justify-center gap-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100"
          >
            <FaTrash /> Thùng rác
          </button>
        </div>

        {showCreate && (
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <input
              placeholder="Mã giảm giá (VD: TET2024)"
              className="border px-4 py-2 rounded uppercase"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
            <input placeholder="Tên chiến dịch" className="border px-4 py-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="border px-4 py-2 rounded" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
              <option value="percent">Giảm theo %</option>
              <option value="fixed">Giảm số tiền cố định</option>
            </select>
            <input placeholder="Giá trị giảm" type="number" className="border px-4 py-2 rounded" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            <input
              placeholder="Đơn hàng tối thiểu (VD: 500000)"
              type="number"
              className="border px-4 py-2 rounded"
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
            />
            <input
              placeholder="Số lượng tối đa (Bỏ trống = không giới hạn)"
              type="number"
              className="border px-4 py-2 rounded"
              value={form.maxUsage}
              onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
            />
            <input placeholder="Ngày hết hạn" type="datetime-local" className="border px-4 py-2 rounded" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            <div className="col-span-2">
              <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full font-bold" onClick={submitCreate}>
                Lưu mã giảm giá
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm font-semibold text-gray-700">
                <th className="p-3 border-b">Mã</th>
                <th className="p-3 border-b">Chiến dịch</th>
                <th className="p-3 border-b">Mức giảm</th>
                <th className="p-3 border-b">Hạn mức/Số lượng</th>
                <th className="p-3 border-b">Hết hạn</th>
                <th className="p-3 border-b">Trạng thái</th>
                <th className="p-3 border-b text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3 font-bold text-blue-600">{row.code}</td>
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.discountType === "percent" ? `${row.discountValue}%` : formatMoney(row.discountValue)}</td>
                  <td className="p-3 text-xs">
                    Min: {formatMoney(row.minOrderValue || 0)} <br />
                    Dùng: {row.usedCount || 0} / {row.maxUsage || "∞"}
                  </td>
                  <td className="p-3 text-red-500">{new Date(row.expiresAt).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3">
                    <button onClick={() => handleToggleStatus(row._id, row.status)}>
                      {row.status === "active" ? <FaCheckCircle className="text-green-500 text-xl" /> : <FaTimesCircle className="text-gray-400 text-xl" />}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => handleDelete(row._id, row.code)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
