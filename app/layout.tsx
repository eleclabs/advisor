import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "./bootstrap";
import Header from "./components/Header.tsx";
import Navbar from "./components/Navbar.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Footer from "./components/Footer.tsx";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient />
        <div className="container" >
          <div className="row"> <Header /> </div>
          <div className="row"> <Navbar /> </div>
          <div className="row">
            <div className="col-md-3"> <Sidebar /> </div>
            <div  className="col-md-9">  {children} </div>
          </div>
          <Footer/>
        </div>
      </body>
    </html>
  );
}
