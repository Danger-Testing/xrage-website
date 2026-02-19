import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "xrageroom - rage in private",
  description:
    "Let out your frustration! Load any tweet and destroy it with flamethrowers, ban hammers, nukes, and more. Record your rage as a GIF.",
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
    title: "xrageroom - rage in private",
    description:
      "Let out your frustration! Load any tweet and destroy it with flamethrowers, ban hammers, nukes, and more.",
    type: "website",
    siteName: "xrageroom",
  },
  twitter: {
    card: "summary_large_image",
    title: "xrageroom - rage in private",
    description: "Let out your frustration! rage in private.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
