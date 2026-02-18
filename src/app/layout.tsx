import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XRageRoom - Destroy Tweets with Style",
  description: "Let out your frustration! Load any tweet and destroy it with flamethrowers, ban hammers, nukes, and more. Record your rage as a GIF.",
  keywords: ["twitter", "rage", "stress relief", "destroy tweets", "fun", "cathartic"],
  authors: [{ name: "XRageRoom" }],
  openGraph: {
    title: "XRageRoom - Destroy Tweets with Style",
    description: "Let out your frustration! Load any tweet and destroy it with flamethrowers, ban hammers, nukes, and more.",
    type: "website",
    siteName: "XRageRoom",
  },
  twitter: {
    card: "summary_large_image",
    title: "XRageRoom - Destroy Tweets with Style",
    description: "Let out your frustration! Destroy tweets with style.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
