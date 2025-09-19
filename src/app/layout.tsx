import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Healthcare TestGen - AI Test Case Generator",
  description:
    "Automated test case generation for healthcare applications with HIPAA compliance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
