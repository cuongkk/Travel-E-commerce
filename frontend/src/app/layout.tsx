import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "../components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "TravelKa - Trải nghiệm hành trình tuyệt vời",
  description: "TravelKa - Nền tảng đặt tour du lịch hàng đầu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi-VN">
      <body>
        <ToastProvider />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
