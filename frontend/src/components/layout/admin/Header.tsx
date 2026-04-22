"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FaBars } from "react-icons/fa6";
import { Sider } from "./Sider";
interface Account {
  fullName: string;
  avatar: string;
  roleName: string;
}

export const Header = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success === true) {
          setAccount(data.data?.account);
        } else {
          toast.error("Lỗi khi lấy thông tin tài khoản: " + data.message);
        }
      });
  }, []);
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-[30px] z-[50]">
        {/* Mobile toggle button */}
        <button className="block lg:hidden bg-white p-2 rounded-md shadow-md" onClick={() => setIsOpen((prev) => !prev)}>
          <FaBars />
        </button>

        {/* Left */}
        <Link href="/admin" className="font-extrabold text-2xl">
          Admin
        </Link>

        {/* Right */}
        <div className="flex items-center justify-center gap-[40px] md:gap-[20px]">
          {/* Notification */}
          <button className="relative flex bg-white border-none">
            <div className="w-[24px] h-[18px] bg-[url('/admin/icon-notify.png')] bg-cover"></div>

            <span className="absolute top-[-5px] left-[18px] w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[12px] font-bold flex items-center justify-center">6</span>

            <span className="absolute bottom-[-5px] left-[15px] w-[6px] h-[6px] rounded-full bg-red-500 opacity-30"></span>
          </button>
          {/* Profile */}
          <div className="flex items-center gap-[10px]">
            <div className="w-[44px] h-[44px] rounded-full border border-black overflow-hidden">
              <img src={account?.avatar} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col items-center gap-[5px]">
              <span className="font-bold text-sm text-gray-700">{account?.fullName}</span>
              <span className="font-semibold text-xs text-gray-500">{account?.roleName}</span>
            </div>
          </div>
        </div>
      </header>
      <Sider isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
