import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { ToastProvider } from "./components/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrUX",
  description: "Assess page performance metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar">
      <body className={`${inter.className} p-5 md:p-10`}>
        <ToastProvider />
        {/* ToastProvider should be a parent of all other components that use the toast */}
        {children}
      </body>
    </html>
  );
}
