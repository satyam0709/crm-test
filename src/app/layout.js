import Navbar from "../component/Navbar/Navbar";
import "../app/globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: "RND TECHNOSOFT CRM – Smart CRM for Closing Deals",
  description:
    "Supercharge your sales with instant lead alerts, lead history tracking, easy follow-ups, and seamless lead management.",
  keywords: ["CRM", "lead management", "sales software", "RND TECHNOSOFT"],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
        <Navbar />
        <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}