import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PinCart AI — Find Trending Products, Launch Your Store in Minutes",
  description:
    "Discover viral Pinterest products, match them to suppliers, generate AI product pages, and export to Shopify — all in under 10 minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
