"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBan, FaCheckCircle, FaUserShield, FaUserEdit } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

type UserItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "initial";
  avatar: string;
};

export default function UserAdminPage() {
  const router = useRouter();
  const { isLogin, isAuthLoaded } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [rows, setRows] = useState<UserItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchFailed(false);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/list`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Không tải được danh sách người dùng");
      }

      const list = (data?.data?.userList || []).map((item: any) => ({
        id: item._id || item.id,
        fullName: item.fullName || "Người dùng ẩn danh",
        email: item.email || "",
        phone: item.phone || "N/A",
        role: item.role || "client",
        status: item.status || "inactive",
        avatar: item.avatar || "",
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
      if (roleFilter && item.role !== roleFilter) return false;
      if (!kw) return true;
      return [item.fullName, item.email, item.phone].join(" ").toLowerCase().includes(kw);
    });
  }, [rows, keyword, statusFilter, roleFilter]);

  const handleToggleStatus = async (user: UserItem) => {
    if (updatingId) return;

    // Prevent banning other admins for safety without a proper superadmin hierarchy
    if (user.role === "admin") {
      setReloadToast("error", "Không thể khóa tài khoản Admin!");
      showReloadToastIfAny();
      return;
    }

    const newStatus = user.status === "active" ? "inactive" : "active";
    const confirmMessage = newStatus === "inactive" ? `Bạn có chắc muốn KHÓA tài khoản ${user.email}?` : `Bạn có chắc muốn MỞ KHÓA tài khoản ${user.email}?`;

    if (!window.confirm(confirmMessage)) return;

    setUpdatingId(user.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/status/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Cập nhật trạng thái thất bại");
      }

      setRows((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      setReloadToast("success", `Tài khoản ${user.email} đã được ${newStatus === "active" ? "mở khóa" : "khóa"}.`);
      showReloadToastIfAny();
    } catch (error: any) {
      setReloadToast("error", error.message || "Cập nhật thất bại");
      showReloadToastIfAny();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa] p-4 md:p-8 space-y-4 md:space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>

      <div className="w-full rounded-xl bg-white border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo tên, email, sđt..."
            className="h-10 w-full md:w-72 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="client">Khách hàng (Client)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đang bị khóa</option>
            <option value="initial">Chờ xác thực</option>
          </select>
        </div>

        {loading && (
          <div className="py-12 flex justify-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && fetchFailed && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-500">Không tải được dữ liệu người dùng.</p>
            <button type="button" onClick={fetchData} className="mt-3 h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !fetchFailed && (
          <div className="overflow-auto rounded-xl border border-gray-100">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Người dùng</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Liên hệ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vai trò</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar || "/admin/assets/images/user-placeholder.png"}
                          alt={item.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(item.fullName) + "&background=random";
                          }}
                        />
                        <div>
                          <div className="font-semibold text-gray-800">{item.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{item.email}</div>
                      <div className="text-xs text-gray-500">{item.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {item.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">
                          <FaUserShield /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                          <FaUserEdit /> Client
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${item.status === "active" ? "bg-green-100 text-green-700" : item.status === "inactive" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.status === "active" ? "Hoạt động" : item.status === "inactive" ? "Đã khóa" : "Chờ kích hoạt"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.role !== "admin" && (
                        <button
                          type="button"
                          disabled={updatingId === item.id}
                          onClick={() => handleToggleStatus(item)}
                          title={item.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            item.status === "active" ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"
                          } ${updatingId === item.id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {updatingId === item.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : item.status === "active" ? (
                            <FaBan />
                          ) : (
                            <FaCheckCircle />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                      Không tìm thấy người dùng phù hợp.
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
