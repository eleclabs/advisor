// app/layout.tsx
import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import BootstrapClient from "./bootstrap";
import ConditionalLayout from "./components/ConditionalLayout";
import { SessionProvider } from "./components/SessionProvider";





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
      <body>
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