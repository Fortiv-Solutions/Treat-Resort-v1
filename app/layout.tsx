import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TreatOS - Treat Hotels & Resorts",
  description: "Enterprise operations system for Treat Hotels & Resorts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-brand="treat-resorts" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-brand-bg text-brand-text-1 font-sans antialiased selection:bg-brand-gold/20 selection:text-brand-text-1">
        {children}
      </body>
    </html>
  );
}
