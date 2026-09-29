import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NWIS | Nearby Wells Intelligence",
  description: "Formation-aware historical well intelligence and evidence-backed drilling alerts.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
