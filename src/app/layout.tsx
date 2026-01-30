import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "Promii",
  description: "Promos locales verificadas",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${GeistSans.className} antialiased dark:bg-gray-950`}
    >
      <body className={GeistMono.variable}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
