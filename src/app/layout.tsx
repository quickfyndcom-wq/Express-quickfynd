import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QuickFynd Express — Powered by Nilaas",
  description:
    "QuickFynd Express courier: track AWB, Kerala hub, pan-India delivery and COD. Powered by Nilaas (GSTIN 32JWYPS4831L1Z1).",
  keywords: [
    "QuickFynd Express",
    "courier Kerala",
    "AWB tracking",
    "NILAAS",
    "COD delivery",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
