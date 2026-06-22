import type React from "react"
import type { Metadata, Viewport } from "next"
import { Public_Sans } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

// Public Sans across all levels - institutional clarity, high-glare legibility.
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "ClimaChain - Climate Intelligence for Africa",
    template: "%s · ClimaChain",
  },
  description:
    "Institutional-grade climate intelligence for African nations. Temperature, precipitation, CO₂ emissions and vegetation indices, paired with policy briefs grounded in World Bank and CMIP6 data.",
  applicationName: "ClimaChain",
  authors: [{ name: "Neuravox Foundation" }],
  publisher: "Neuravox Foundation",
  keywords: [
    "climate data",
    "Africa",
    "World Bank",
    "CMIP6",
    "NDVI",
    "CO2 emissions",
    "climate adaptation",
    "ClimaChain",
    "Neuravox",
  ],
  metadataBase: new URL("https://climachain.online"),
  openGraph: {
    title: "ClimaChain - Climate Intelligence for Africa",
    description: "A Neuravox platform for climate analytics across the African continent.",
    type: "website",
    siteName: "ClimaChain",
    url: "https://climachain.online",
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/icon.png" }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#16110e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${publicSans.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
