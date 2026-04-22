"use client";

import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";

export type AdminInfo = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  status?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include",
  });
  return res.json();
};

export const useAuth = () => {
  const pathname = usePathname();
  const router = useRouter();

  const shouldFetch = true;

  const { data, error, isLoading, mutate } = useSWR(shouldFetch ? `${process.env.NEXT_PUBLIC_API_URL}/auth/me` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const isLogin = data?.success === true && data.data?.account?.role === "admin";

  const logout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();

      if (result.success === true) {
        setReloadToast("success", result.message);
        showReloadToastIfAny();
        setTimeout(() => {
          mutate();
          router.push("/admin/login");
        }, 1000);
      } else {
        setReloadToast("error", result.message);
        showReloadToastIfAny();
      }
    } catch (error) {
      setReloadToast("error", "Logout thất bại!");
      showReloadToastIfAny();
    }
  };

  return {
    isLogin,
    isAuthLoaded: !isLoading,
    adminInfo: data?.data?.account ?? null,
    userInfo: data?.data?.account ?? null,
    error,
    logout,
    mutate,
  };
};
