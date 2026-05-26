import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TreatOS - Treat Hotels & Resorts",
  description: "Enterprise operations system for Treat Hotels & Resorts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-brand="treat-resorts">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
