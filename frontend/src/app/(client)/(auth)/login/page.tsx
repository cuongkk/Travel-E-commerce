"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaEnvelope, FaLock } from "react-icons/fa";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      setReloadToast("error", "Vui lòng nhập đầy đủ email và mật khẩu.");
      showReloadToastIfAny();
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberPassword: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        setReloadToast("error", data?.message || "Đăng nhập thất bại.");
        showReloadToastIfAny();
        return;
      }

      if (data.data?.user?.role !== "client") {
        setReloadToast("error", "Tài khoản này không có quyền truy cập vào giao diện khách hàng.");
        showReloadToastIfAny();
        return;
      }

      setReloadToast("success", data?.message || "Đăng nhập thành công.");
      showReloadToastIfAny();

      const redirectParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") || "/" : "/";
      const safeRedirect = redirectParam.startsWith("/") ? redirectParam : "/";
      router.push(safeRedirect);
    } catch {
      setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      showReloadToastIfAny();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen flex flex-col lg:flex-row relative">
        {/* Left: Editorial Image (Visible on Desktop) */}
        <div className="hidden lg:block lg:w-[55%] xl:w-[60%] h-screen sticky top-0 overflow-hidden">
          <img src="https://res.cloudinary.com/dkamd3ghb/image/upload/v1776134348/unnamed_rbb1kr.png" className="absolute w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-r from-on-background/20 to-transparent" />
          <div className="absolute bottom-24 left-12 right-12 z-20">
            <div className="max-w-xl">
              <h2 className="text-white font-headline text-6xl font-black italic leading-none tracking-tighter mb-6">
                KHÁM PHÁ <br /> THIÊN ĐƯỜNG
              </h2>
              <p className="text-white/80 text-lg font-medium leading-relaxed max-w-md">Trải nghiệm những điểm đến được tuyển chọn kỹ lưỡng. Hành trình tiếp theo của bạn bắt đầu từ đây.</p>
              <div className="mt-8 flex gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high" />
                </div>
                <p className="text-white text-sm self-center font-medium">Hơn 10.000 du khách đã tham gia trong tháng này</p>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Background Overlay (Legacy look for mobile) */}
        <img src="https://res.cloudinary.com/dkamd3ghb/image/upload/v1776134348/unnamed_rbb1kr.png" className="lg:hidden absolute w-full h-full inset-0 bg-cover bg-position-center" />
        <div className="lg:hidden mb-[49.75px] inset-0 z-10 bg-on-background/20 backdrop-blur-[60px]" />
        {/* Right: Login Form */}
        <div className="relative z-30 flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-24 lg:bg-surface min-h-screen">
          <div className="w-full max-w-lg lg:max-w-md">
            {/* Login Card */}
            <div className="bg-surface-container-lowest lg:bg-transparent rounded-full lg:rounded-none p-12 md:p-16 lg:p-0 shadow-[0_24px_48px_-12px_rgba(17,24,39,0.08)] lg:shadow-none flex flex-col items-center lg:items-start">
              {/* Logo for mobile (hidden on lg because it's in nav) */}
              <div className="mb-12 lg:hidden">
                <span className="font-headline font-black italic text-2xl tracking-tighter text-on-surface">
                  Travel<span className="text-primary">Ka</span>
                </span>
              </div>
              {/* Headline */}
              <div className="text-center lg:text-left mb-10 w-full">
                <h2 className="font-headline text-4xl md:text-5xl lg:text-4xl font-extrabold text-on-background tracking-tight mb-2">Chào mừng bạn quay lại</h2>
                <p className="text-on-surface-variant font-medium tracking-wide">Nhập thông tin để tiếp tục hành trình</p>
              </div>
              {/* Form Section */}
              <form className="w-full space-y-6" onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant ml-4 lg:ml-0">Địa chỉ Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant"></FaEnvelope>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-transparent border border-outline-variant/15 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline-variant/60"
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4 lg:px-0">
                    <label className="block font-label text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">Mật khẩu</label>
                    <a className="text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-80 transition-opacity" href="#">
                      Quên mật khẩu
                    </a>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant"></FaLock>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-transparent border border-outline-variant/15 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body text-on-surface placeholder:text-outline-variant/60"
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
                {/* Login Button */}
                <div className="pt-4">
                  <button
                    disabled={isLoading}
                    className="w-full py-5 rounded-full bg-[#5EEB5B] text-on-primary-fixed font-headline font-bold text-lg shadow-xl shadow-[#5EEB5B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    type="submit"
                  >
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    <FaArrowRight className="transition-transform group-hover:translate-x-1"></FaArrowRight>
                  </button>
                </div>
              </form>
              {/* Footer Links */}
              <div className="mt-12 text-center lg:text-right w-full">
                <p className="text-on-surface-variant font-medium">
                  Chưa có tài khoản?
                  <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" href="/register">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Editorial Text Accents for Mobile (Preserved) */}
        <div className="absolute top-24 left-12 z-20 md:block lg:hidden hidden">
          <h1 className="text-white/20 font-headline font-black italic text-[12vw] leading-none tracking-tighter select-none">TRAVEL</h1>
        </div>
      </main>
    </>
  );
}
