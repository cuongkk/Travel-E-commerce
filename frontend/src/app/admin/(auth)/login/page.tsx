"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setReloadToast, showReloadToastIfAny } from "../../../../utils/toast";
import { mutate } from "swr";
import { useAuth } from "@/hooks/useAuth";

type LoginFormData = {
  email: string;
  password: string;
  rememberPassword: boolean;
};

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLogin, isAuthLoaded } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberPassword: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const redirectParam = searchParams.get("redirect") || "/admin";
  const redirectPath = redirectParam.startsWith("/admin") ? redirectParam : "/admin";

  useEffect(() => {
    showReloadToastIfAny();
  }, []);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (isLogin) {
      router.replace(redirectPath);
    }
  }, [isAuthLoaded, isLogin, redirectPath, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberPassword: data.rememberPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.success !== true) {
        setReloadToast("error", responseData.message);
        showReloadToastIfAny();
      } else {
        await mutate(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
        setReloadToast("success", responseData.message);
        showReloadToastIfAny();
        router.replace(redirectPath);
      }
    } catch {
      setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      showReloadToastIfAny();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-gray-300 p-16 md:p-24">
      <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Đăng nhập</h1>
      <p className="text-lg font-semibold text-gray-800 text-center mb-10 opacity-75">Vui lòng nhập email và mật khẩu để tiếp tục</p>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
        <div className="relative">
          <label htmlFor="email" className="block w-full font-semibold text-lg text-gray-800 mb-4 text-left">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Ví dụ: levana@gmail.com"
            required
            {...register("email", {
              required: "Vui lòng nhập email!",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không đúng định dạng!",
              },
            })}
            className="w-full px-4 py-4 bg-gray-100 border border-gray-300 rounded-lg text-lg font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <span className="block text-red-500 text-sm font-semibold mt-1">{errors.email.message}</span>}
        </div>

        <div className="relative">
          <label htmlFor="password" className="block w-full font-semibold text-lg text-gray-800 mb-4 text-left">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            placeholder="Nhập mật khẩu"
            required
            {...register("password", {
              required: "Vui lòng nhập mật khẩu!",
              minLength: {
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
              maxLength: {
                value: 30,
                message: "Mật khẩu không được vượt quá 30 ký tự",
              },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
                message: "Mật khẩu phải chứa chữ cái và số",
              },
            })}
            className="w-full px-4 py-4 bg-gray-100 border border-gray-300 rounded-lg text-lg font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <span className="block text-red-500 text-sm font-semibold mt-1">{errors.password.message}</span>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="remember" {...register("rememberPassword")} className="w-5 h-5 accent-blue-500 cursor-pointer" />
            <label htmlFor="remember" className="font-semibold text-lg text-gray-800">
              Nhớ mật khẩu
            </label>
          </div>
          <Link href="/admin/forget-password" className="font-semibold text-lg text-gray-800 opacity-60 hover:opacity-100 transition">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-500 text-white font-bold text-xl rounded-lg opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className="font-semibold text-lg text-gray-800 opacity-60">Bạn chưa có tài khoản?</span>
        <Link href="/admin/register" className="font-bold text-lg text-blue-500 underline hover:text-blue-600 transition">
          Tạo tài khoản
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
