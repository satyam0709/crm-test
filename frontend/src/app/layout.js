import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Providers from "./providers";
import "./globals.css";
import ContactPopup from "@/components/contactpopup/ContactPopup";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Providers>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ContactPopup />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}