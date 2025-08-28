import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: {
    default: "Pivot - AI-Powered Analytics & Chat Platform",
    template: "%s | Pivot"
  },
  description: "Transform your business with Pivot - an advanced AI-powered platform featuring intelligent chatbots, real-time analytics, file management, and seamless user authentication. Built for modern enterprises.",
  keywords: [
    "AI",
    "chatbot platform", 
    "business analytics",
    "file management",
    "enterprise software",
    "artificial intelligence",
    "data visualization",
    "chat interface",
    "business intelligence",
    "productivity tools"
  ],
  authors: [{ name: "Pivot Team" }],
  creator: "Pivot",
  publisher: "Pivot",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pivot-dashboard.com",
    siteName: "Pivot",
    title: "Pivot - AI-Powered Analytics & Chat Platform",
    description: "Transform your business with Pivot - an advanced AI-powered platform featuring intelligent chatbots, real-time analytics, and enterprise-grade tools.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Pivot - AI-Powered Business Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pivot - AI-Powered Analytics & Chat Platform",
    description: "Transform your business with advanced AI-powered tools, intelligent chatbots, and real-time analytics.",
    images: ["/logo.png"],
    creator: "@Pivot",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html id="app_root" lang="en" className="light" style={{colorScheme: "light"}}>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-playfair: ${playfair.variable};
}
        `}</style>
      </head>
      <body className={`${playfair.variable} antialiased flex`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
