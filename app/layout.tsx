import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "ClimaChain — Climate Intelligence for Africa",
    template: "%s · ClimaChain",
  },
  description:
    "Enterprise-grade climate intelligence for African nations. Temperature, precipitation, CO₂ emissions and vegetation health with AI-assisted policy briefs.",
  applicationName: "ClimaChain",
  authors: [{ name: "Neuravox Foundation" }],
  keywords: [
    "climate data",
    "Africa",
    "World Bank",
    "CMIP6",
    "NDVI",
    "CO2 emissions",
    "climate adaptation",
    "ClimaChain",
  ],
  metadataBase: new URL("https://climachain.pages.dev"),
  openGraph: {
    title: "ClimaChain — Climate Intelligence for Africa",
    description:
      "Real-time climate analytics and AI-generated policy briefs for African nations, built on World Bank, CMIP6 and Copernicus data.",
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
