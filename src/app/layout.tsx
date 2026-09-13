import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sans = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const serif = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "讀經旅行團｜2026 信心之旅",
    template: "%s｜讀經旅行團",
  },
  description:
    "中華宣道會大坑東堂青少年部・聖經旅行團／三年讀經之旅。每日和合本經文，完成閱讀後主持人可看見進度。",
  applicationName: "讀經旅行團",
  appleWebApp: {
    capable: true,
    title: "讀經旅行團",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3ecdc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
