import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Playfair_Display } from "next/font/google";
import "../../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { UserSidebar } from "@/components/userSidebar";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "RAG Chatbot Dashboard",
  description: "Professional AI chatbot management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

        // <ThemeProvider
        //   attribute="class"
        //   defaultTheme="light"
        //   enableSystem={false}
        // >
        //   <AuthProvider>
        //     <UserSidebar />

            <main className="flex-1 overflow-hidden">{children}</main>
        //     <Toaster />
        //   </AuthProvider>
        // </ThemeProvider>
  );
}
