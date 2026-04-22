"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { siderList, settingList } from "../../../configs/admin.config";
import { usePathname } from "next/dist/client/components/navigation";

interface SiderProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}
export const Sider = ({ isOpen, setIsOpen }: SiderProps) => {
  const location = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    const currentSplit = location.split("/");
    const targetSplit = path.split("/");
    return currentSplit[1] === targetSplit[1] && currentSplit[2] === targetSplit[2];
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success === true) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setIsOpen(false)}></div>}

      {/* Sidebar */}
      <nav
        className={`fixed left-0 top-0 mt-[70px] z-[40] w-[240px] h-[calc(100vh-70px)] bg-white border-r border-gray-200 overflow-y-auto transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:z-20`}
      >
        {/* Menu */}
        <ul className="flex flex-col items-start px-[12px] py-[10px] gap-2">
          {siderList.map((item) => (
            <li key={item.path} className="w-full list-none">
              <Link
                href={item.path}
                className={`relative flex items-center gap-[15px] px-[20px] py-[12px] rounded-md transition
                ${isActive(item.path) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-500 hover:text-white"}`}
              >
                {/* Thanh bên trái */}
                <span
                  className={`absolute left-[-28px] w-[9px] h-full rounded-md
                  ${isActive(item.path) ? "bg-blue-500" : "bg-transparent group-hover:bg-blue-500"}`}
                ></span>

                <i className="fa-solid fa-chart-line"></i>
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <hr className="w-[240px] border border-gray-200" />

        {/* Setting */}
        <ul className="flex flex-col items-start px-[12px] py-[10px] gap-2">
          {settingList.map((item) => (
            <li key={item.path} className="w-full list-none">
              <Link
                href={item.path}
                className={`relative flex items-center gap-[15px] px-[20px] py-[12px] rounded-md transition
                ${isActive(item.path) ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-blue-500 hover:text-white"}`}
              >
                <span
                  className={`absolute left-[-28px] w-[9px] h-full rounded-md
                  ${isActive(item.path) ? "bg-blue-500" : "bg-transparent"}`}
                ></span>

                <i className="fa-solid fa-cog"></i>
                <span className="font-semibold text-sm">{item.name}</span>
              </Link>
            </li>
          ))}

          {/* Logout */}
          <li className="w-full list-none">
            <button onClick={handleLogout} className="w-full flex items-center gap-[15px] px-[20px] py-[12px] rounded-md text-red-500 hover:bg-red-100 transition">
              <i className="fa-solid fa-power-off"></i>
              <span className="font-semibold text-sm">Đăng xuất</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};
