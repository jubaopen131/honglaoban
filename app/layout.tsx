import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Assuming shadcn/ui setup

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "哄老板模拟器",
  description: "看看你的求生欲有多强！",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
