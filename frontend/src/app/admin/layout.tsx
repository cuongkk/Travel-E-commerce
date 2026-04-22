import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TravelKa - Quản trị hệ thống",
  description: "TravelKa - Quản trị hệ thống",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
