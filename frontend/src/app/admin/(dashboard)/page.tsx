"use client";

import { useState, useEffect } from "react";
import { setReloadToast } from "@/utils/toast";
import { RevenueChart } from "@/components/ui/Chart";

import { FaUsers, FaShoppingCart, FaCoins, FaChartLine, FaCalendarAlt } from "react-icons/fa";

type OverviewData = {
  totalAdmin: number;
  totalOrder: number;
  totalRevenue: number;
};

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewData>({
    totalAdmin: 0,
    totalOrder: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`;
        const response = await fetch(apiUrl, {
          credentials: "include",
        });

        const responseData = await response.json();

        if (responseData.success) {
          setOverview(responseData.data?.overview || { totalAdmin: 0, totalOrder: 0, totalRevenue: 0 });
        } else {
          setReloadToast("error", responseData.message || "Lỗi khi tải dữ liệu dashboard");
        }
      } catch (error) {
        setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <div className="w-full min-h-full bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Tổng Quan Hệ Thống</h1>
          <p className="text-sm text-gray-500 mt-1">Trang phân tích và đo lường thông số TravelKa</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
          <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded text-gray-600 font-medium text-sm">
            <FaCalendarAlt className="mr-2 text-blue-500" /> Cập nhật mới nhất
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Users */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Khách hàng</p>
                  <h3 className="text-4xl font-extrabold text-gray-800">{formatCurrency(overview.totalAdmin)}</h3>
                </div>
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Đơn đặt Tour / Gear</p>
                  <h3 className="text-4xl font-extrabold text-gray-800">{formatCurrency(overview.totalOrder)}</h3>
                </div>
                <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Tổng Doanh Thu</p>
                  <h3 className="text-4xl font-extrabold text-gray-800"><span className="text-xl">đ</span>{formatCurrency(overview.totalRevenue)}</h3>
                </div>
                <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <FaCoins className="text-2xl text-emerald-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FaChartLine className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Biểu Đồ Doanh Thu</h2>
                  <p className="text-sm text-gray-500">So sánh doanh thu với biểu đồ tháng trước</p>
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Chọn tháng phân tích:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="w-full bg-slate-50/50 rounded-xl p-4">
              <RevenueChart selectedMonth={selectedMonth} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
