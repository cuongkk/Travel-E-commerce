"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaRotateLeft, FaTrash } from "react-icons/fa6";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

type GearItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "active" | "inactive";
  deletedAt?: Date;
};

export default function GearTrashPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<GearItem[]>([]);

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/trash`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Không tải được thùng rác gear");
      }

      const list = (data?.data?.gearList || []).map((item: any) => ({
        id: item._id || item.id,
        name: item.name || "",
        category: item.category || "",
        price: Number(item.price || 0),
        status: item.status || "inactive",
        deletedAt: item.deletedAt,
      }));

      setRows(list);
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
      router.push("/admin/login");
      return;
    }

    fetchData();
  }, [isAuthLoaded, isLogin]);

  const handleRestore = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn khôi phục gear "${name}" không?`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/restore/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Khôi phục thất bại");
      }

      setReloadToast("success", "Phục hồi thành công");
      showReloadToastIfAny();
      await fetchData();
    } catch (error: any) {
      setReloadToast("error", error.message || "Lỗi khôi phục");
      showReloadToastIfAny();
    }
  };

  const handleHardDelete = async (id: string, name: string) => {
    if (!window.confirm(`CẢNH BÁO: Xóa vĩnh viễn gear "${name}" sẽ không thể khôi phục lại. Bạn có chắc không?`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gear/hard-delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Xóa vĩnh viễn thất bại");
      }

      setReloadToast("success", "Đã xóa vĩnh viễn");
      showReloadToastIfAny();
      await fetchData();
    } catch (error: any) {
      setReloadToast("error", error.message || "Lỗi xóa vĩnh viễn");
      showReloadToastIfAny();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] p-4 md:p-8 space-y-4 md:space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/gear")} className="p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50">
          🔙 Quay lại
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thùng rác Gear</h1>
      </div>

      <div className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải dữ liệu thùng rác...</div>
        ) : (
          <div className="overflow-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tên gear</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Danh mục</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Giá</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ngày xóa</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-700">{item.category}</td>
                    <td className="px-4 py-3 text-gray-700">{item.price.toLocaleString("vi-VN")}đ</td>
                    <td className="px-4 py-3 text-red-500">{item.deletedAt ? new Date(item.deletedAt).toLocaleString("vi-VN") : "N/A"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => handleRestore(item.id, item.name)} className="px-3 py-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center font-semibold gap-2">
                           Khôi phục
                        </button>
                        <button type="button" onClick={() => handleHardDelete(item.id, item.name)} className="w-8 h-8 rounded-md bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      Thùng rác trống.
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
