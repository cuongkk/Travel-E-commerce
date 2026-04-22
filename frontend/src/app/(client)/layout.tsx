import type { Metadata } from "next";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import ToastProvider from "../../components/ui/ToastProvider";
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
        <Header />
        <main className="bg-surface font-body text-on-surface overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
