import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://toolnest-vert.vercel.app"),
  title: {
    template: "%s | ToolNest — Free Online Tools",
    default: "ToolNest — 453+ Free Tools. What AI Talks About, We Do.",
  },
  description:
    "453+ free online tools for PDF, image, text, developer, calculator and more. No signup. Runs in browser. Your files never uploaded.",
  keywords:
    "free online tools, pdf tools, image tools, developer tools, no signup tools, browser tools",
  authors: [{ name: "ToolNest" }],
  creator: "ToolNest",
  robots: "index, follow",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    siteName: "ToolNest",
    title: "ToolNest — 453+ Free Tools. What AI Talks About, We Do.",
    description:
      "Free online tools for PDF, image, text, developer, calculator and more. No signup required.",
    url: "https://toolnest-vert.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolNest — 453+ Free Online Tools",
    description: "What AI Can Only Talk About — We Actually Do It.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${syne.variable} antialiased`}
    >
      <head>
        {/* Replace ca-pub-XXXXXXXXXXXXXXXX with your AdSense publisher ID */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
      </head>
      <body className="min-h-screen flex flex-col bg-bg-base text-text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
