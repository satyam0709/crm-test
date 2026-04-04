"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ContactPopup from "@/components/contactpopup/ContactPopup";
import Providers from "@/app/providers";

const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/add-package",
  "/cart",
  "/leads",
  "/tasks",
  "/reminders",
  "/meetings",
  "/notes",
  "/chat",
  "/calendar",
  "/customers",
  "/invoice",
  "/storage",
  "/reports",
  "/hr",
  "/hr-ops",
  "/settings",
  "/search",
];

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isApp = DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <Providers>
      {!isApp && <Navbar />}
      {isApp ? children : <main>{children}</main>}
      {!isApp && <Footer />}
      {!isApp && <ContactPopup />}
    </Providers>
  );
}