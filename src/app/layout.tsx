import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TestGen - AI Test Case Generator",
  description: "Chat-driven test case generation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
