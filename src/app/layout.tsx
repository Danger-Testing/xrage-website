import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xrageroom - destroy a tweet",
  description: "destroy a tweet",
  keywords: [
    "twitter",
    "rage",
    "stress relief",
    "destroy tweets",
    "fun",
    "cathartic",
  ],
  authors: [{ name: "xrageroom" }],
  openGraph: {
    title: "xrageroom - destroy a tweet",
    description: "destroy a tweet",
    type: "website",
    siteName: "xrageroom",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "xrageroom - destroy a tweet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "xrageroom - destroy a tweet",
    description: "destroy a tweet",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="appdrop-follow-widget"
          src="https://www.appdrop.com/appdrop-follow-widget.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
