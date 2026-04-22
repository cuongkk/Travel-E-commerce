"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaCartShopping } from "react-icons/fa6";
import { FaBars, FaXmark } from "react-icons/fa6";
import { setReloadToast, showReloadToastIfAny } from "@/utils/toast";
import type { ApiResponse, AuthMeData, DashboardInfoData, SettingWebsiteInfo } from "@/types/client-api";
import { getMyCart, onCartUpdated } from "@/utils/cart-client";

type MainNavItem = {
  label: string;
  href: string;
};

const mainNavItems: MainNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Tours", href: "/tour" },
  { label: "Gear", href: "/gear" },
  { label: "Journal", href: "/journal" },
];

export const Header = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [settingWebsiteInfo, setSettingWebsiteInfo] = useState<SettingWebsiteInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const isNavActive = (href: string): boolean => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isCartActive = pathname === "/cart" || pathname?.startsWith("/cart/");
  const isProfileActive = pathname === "/profile" || pathname?.startsWith("/profile/");

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/info`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Khong the tai thong tin header");
        }

        const payload = (await response.json()) as ApiResponse<DashboardInfoData>;
        setSettingWebsiteInfo(payload.data?.settingWebsiteInfo || null);
      } catch (error) {
        console.error("Fetch header data error", error);
      }
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const payload = (await response.json()) as ApiResponse<AuthMeData>;
        const loggedIn = response.ok && payload?.success === true && payload.data?.account?.role === "client";
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const account = payload.data?.account;
          const fallbackName = account?.email?.split("@")[0] || "Tài khoản";
          setUserDisplayName(account?.fullName?.trim() || fallbackName);
        } else {
          setUserDisplayName("");
        }
      } catch {
        setIsLoggedIn(false);
        setUserDisplayName("");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      setCartCount(0);
      return;
    }

    const loadCartCount = async () => {
      try {
        const cartData = await getMyCart();
        setCartCount(cartData.summary.totalQuantity || 0);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
    const unsubscribe = onCartUpdated(loadCartCount);

    return () => {
      unsubscribe();
    };
  }, [isLoggedIn, pathname]);

  const handleLogout = async () => {
    if (logoutLoading) return;

    try {
      setLogoutLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      const payload = await response.json();

      if (!response.ok || payload?.success !== true) {
        setReloadToast("error", payload?.message || "Đăng xuất thất bại.");
        showReloadToastIfAny();
        return;
      }

      setIsLoggedIn(false);
      setUserDisplayName("");
      setCartCount(0);
      setReloadToast("success", payload?.message || "Đăng xuất thành công.");
      showReloadToastIfAny();
      setOpenMenu(false);
      router.refresh();
    } catch {
      setReloadToast("error", "Lỗi kết nối. Vui lòng thử lại.");
      showReloadToastIfAny();
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200">
      <nav className="flex justify-between items-center h-20 px-4 md:px-8 max-w-8xl mx-auto">
        <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tighter text-slate-900 dark:text-white font-headline">
          {settingWebsiteInfo?.websiteName || "TravelKa"}
        </Link>

        <div className="hidden md:flex items-center space-x-8 font-headline text-lg font-semibold tracking-tight">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              className={`transition-colors ${isNavActive(item.href) ? "text-primary" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" aria-label="Cart" className={`relative transition-all ${isCartActive ? "text-primary" : "text-on-surface-variant hover:opacity-80"}`}>
            <FaCartShopping className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold inline-flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {isLoggedIn && (
            <Link
              href="/profile"
              className={`max-w-44 truncate text-sm font-semibold transition-colors ${isProfileActive ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
              title={userDisplayName}
            >
              {userDisplayName}
            </Link>
          )}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="primary-gradient-btn text-on-primary font-bold px-6 py-2 rounded-full scale-105 active:scale-95 transition-transform disabled:opacity-70"
            >
              {logoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          ) : (
            <Link href="/login" className="primary-gradient-btn text-on-primary font-bold px-6 py-2 rounded-full scale-105 active:scale-95 transition-transform">
              Đăng nhập
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpenMenu((prev) => !prev)}
          className="md:hidden w-10 h-10 rounded-full border border-outline-variant/20 inline-flex items-center justify-center text-on-surface"
          aria-label="Toggle menu"
          aria-expanded={openMenu}
        >
          {openMenu ? <FaXmark className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </nav>

      {openMenu && (
        <div className="md:hidden border-t border-outline-variant/15 bg-surface px-4 pb-6">
          <div className="flex flex-col gap-2 py-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenMenu(false)}
                className={`px-3 py-2 rounded-lg transition-colors ${isNavActive(item.href) ? "bg-surface-container-low text-primary" : "text-on-surface hover:bg-surface-container-low"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/cart"
              onClick={() => setOpenMenu(false)}
              className={`text-center px-3 py-2 rounded-lg border border-outline-variant/20 ${isCartActive ? "text-primary border-primary/50" : "text-on-surface"}`}
            >
              Giỏ hàng{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpenMenu(false)}
                  className={`text-center px-3 py-2 rounded-lg border border-outline-variant/20 ${isProfileActive ? "text-primary border-primary/50" : "text-on-surface"}`}
                >
                  {userDisplayName || "Tài khoản"}
                </Link>
                <button type="button" onClick={handleLogout} disabled={logoutLoading} className="text-center px-3 py-2 rounded-lg primary-gradient-btn text-on-primary font-bold disabled:opacity-70">
                  {logoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpenMenu(false)} className="text-center px-3 py-2 rounded-lg primary-gradient-btn text-on-primary font-bold">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
