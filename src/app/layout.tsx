import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/session-provider";
import { Navigation } from "@/components/layout/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Learning Platform - Connect with Expert Teachers",
  description: "Learn English with certified teachers through 1-on-1 online classes. Book flexible sessions and improve your language skills with personalized instruction.",
  keywords: ["English learning", "online classes", "language learning", "1-on-1 tutoring", "English teachers"],
  authors: [{ name: "English Learning Platform" }],
  openGraph: {
    title: "English Learning Platform",
    description: "Connect with expert English teachers for personalized 1-on-1 online classes",
    url: "https://english-learning-platform.com",
    siteName: "English Learning Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "English Learning Platform",
    description: "Connect with expert English teachers for personalized 1-on-1 online classes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <Navigation />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
