import { ClerkProvider } from "@clerk/nextjs";
import ConditionalLayout from "@/components/ConditionalLayout/conditionalLayout";
import "./globals.css";

export const metadata = {
  title: "365 RND CRM",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <ConditionalLayout>{children}</ConditionalLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}