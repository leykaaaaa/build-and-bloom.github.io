"use client";

import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isAdminPage =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
      </head>
      <body>
        {!isAdminPage && <Navbar />}

        <main>
          {children}
        </main>

        {!isAdminPage && <Footer />}
      </body>
    </html>
  );
}