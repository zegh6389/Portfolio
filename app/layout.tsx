import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { MotionProvider } from "@/components/MotionProvider";
import FloatingSocial from "@/components/FloatingSocial";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio | Full Stack Developer",
  description: "Welcome to my portfolio. I'm a passionate full stack developer specializing in modern web technologies.",
  keywords: "portfolio, web developer, full stack, React, Next.js, TypeScript",
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Portfolio | Full Stack Developer",
    description: "Welcome to my portfolio. I'm a passionate full stack developer specializing in modern web technologies.",
    type: "website",
    locale: "en_US",
    url: "https://yourportfolio.com",
    siteName: "Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <MotionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            {/* Floating social bar (fixed bottom center) */}
            <FloatingSocial />
            <Toaster />
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
