import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Manrope, Space_Grotesk } from "next/font/google"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
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
    description: "A Neuravox Foundation platform for climate analytics across the African continent.",
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
    { media: "(prefers-color-scheme: light)", color: "#f8f9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#07101e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.variable} ${manrope.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
