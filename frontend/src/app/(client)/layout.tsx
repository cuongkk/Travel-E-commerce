import type { Metadata } from "next";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import ToastProvider from "../../components/ui/ToastProvider";
export const metadata: Metadata = {
  title: "Travelka - Du lịch Việt Nam",
  description: "Travelka - Du lịch Việt Nam",
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
