// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import BootstrapClient from "./bootstrap";
import ConditionalLayout from "./components/ConditionalLayout";
import { SessionProvider } from "./components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบดูแลช่วยเหลือผู้เรียน"
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <BootstrapClient />
        <SessionProvider>
          <div className="container-fluid p-0">
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}