import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "../components/ui/ToastProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://travelka.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TravelKa - Trải nghiệm hành trình tuyệt vời",
    template: "%s | TravelKa",
  },
  description:
    "TravelKa - Nền tảng đặt tour du lịch hàng đầu Việt Nam. Khám phá hàng trăm tour hấp dẫn, đặt chỗ dễ dàng, thanh toán an toàn qua MoMo & ZaloPay.",
  keywords: ["tour du lịch", "đặt tour", "du lịch Việt Nam", "TravelKa", "tour giá rẻ"],
  authors: [{ name: "TravelKa Team" }],
  creator: "TravelKa",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "TravelKa",
    title: "TravelKa - Trải nghiệm hành trình tuyệt vời",
    description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam. Khám phá và đặt tour dễ dàng.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TravelKa - Nền tảng đặt tour du lịch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelKa - Trải nghiệm hành trình tuyệt vời",
    description: "Nền tảng đặt tour du lịch hàng đầu Việt Nam.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
