"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"success" | "error" | "loading">("loading");

  useEffect(() => {
    // For ZaloPay redirect callback
    const apptransid = searchParams.get("apptransid");
    const statusParam = searchParams.get("status");

    if (apptransid && statusParam === "1") {
      setStatus("success");
    } else if (apptransid && statusParam !== "1") {
      setStatus("error");
    } else {
      // By default if just landing here normally
      setStatus("success");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-on-surface-variant font-medium">Đang xử lý kết quả thanh toán...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center space-y-6">
        <FaExclamationCircle className="text-red-500 text-6xl md:text-8xl mb-4" />
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">Thanh toán thất bại</h1>
        <p className="text-on-surface-variant text-lg">
          Đã có lỗi xảy ra trong quá trình thanh toán qua ZaloPay hoặc giao dịch đã bị hủy. Vui lòng thử lại sau.
        </p>
        <div className="pt-8">
          <button
            onClick={() => router.push("/checkout")}
            className="bg-primary text-on-primary font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Quay lại Giỏ Hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center space-y-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <FaCheckCircle className="text-green-500 text-6xl md:text-7xl" />
      </div>
      <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface">Đặt tour thành công!</h1>
      <p className="text-on-surface-variant text-lg">
        Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi. Chúng tôi sẽ liên hệ sớm nhất để xác nhận thông tin chi tiết.
      </p>
      <div className="flex gap-4 pt-8">
        <button
          onClick={() => router.push("/profile")}
          className="bg-surface-container-high text-on-surface font-bold py-4 px-8 rounded-full hover:bg-surface-container-highest transition-all"
        >
          Về Trang Cá Nhân
        </button>
        <button
          onClick={() => router.push("/")}
          className="bg-primary text-on-primary font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          Tiếp tục khám phá
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 lg:py-16 w-full min-h-[70vh] flex items-center justify-center">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-on-surface-variant font-medium">Đang tải...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
