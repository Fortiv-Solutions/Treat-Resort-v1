import type { Metadata } from "next";
import { Cinzel, Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["500", "600", "700"],
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TreatOS - Treat Hotels & Resorts",
  description: "Enterprise operations system for Treat Hotels & Resorts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-brand="treat-resorts" className={`${inter.variable} ${cinzel.variable} ${robotoSlab.variable}`}>
      <body className="min-h-screen bg-brand-bg text-brand-text-1 font-sans antialiased selection:bg-brand-gold/25 selection:text-brand-ink">
        {children}
      </body>
    </html>
  );
}
