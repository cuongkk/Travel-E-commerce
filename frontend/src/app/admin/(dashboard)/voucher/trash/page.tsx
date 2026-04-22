"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrashRestore, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

export default function VoucherTrashPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/trash`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Lỗi tải dữ liệu thùng rác");
      setRows(data.data.trashedList || []);
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

  const handleRestore = async (id: string, code: string) => {
    if (!confirm(`Khôi phục mã giảm giá ${code}?`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/restore/${id}`, {
        method: "PATCH",
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

  const handleHardDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa vĩnh viễn mã giảm giá ${code}? Hành động này KHÔNG THỂ hoàn tác!`)) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher/delete-hard/${id}`, {
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
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/voucher")} className="text-gray-500 hover:text-gray-700">
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thùng rác mã giảm giá</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm font-semibold text-gray-700">
                <th className="p-3 border-b">Mã</th>
                <th className="p-3 border-b">Chiến dịch</th>
                <th className="p-3 border-b">Mức giảm</th>
                <th className="p-3 border-b">Ngày xóa</th>
                <th className="p-3 border-b text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3 font-bold text-blue-600">{row.code}</td>
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.discountType === "percent" ? `${row.discountValue}%` : formatMoney(row.discountValue)}</td>
                  <td className="p-3 text-red-500">{new Date(row.deletedAt).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => handleRestore(row._id, row.code)} className="text-green-600 hover:text-green-800" title="Khôi phục">
                      <FaTrashRestore className="text-lg" />
                    </button>
                    <button onClick={() => handleHardDelete(row._id, row.code)} className="text-red-500 hover:text-red-700" title="Xóa vĩnh viễn">
                      <FaTimes className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">Thùng rác trống</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
