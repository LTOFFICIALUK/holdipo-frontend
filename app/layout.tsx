import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { WalletPicker } from "@/components/wallet-button";
import { StatusProvider } from "@/lib/status";
import { WalletProvider } from "@/lib/wallet";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600", "700"] });
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", weight: ["300", "400", "500"] });

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://holdipo.fun";
const title = "holdipo · get paid in PreStocks";
const description = "hold the coin. get paid in a token that tracks openai.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: title, template: "%s · holdipo" },
  description,
  applicationName: "holdipo",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: { title, description, url: site, siteName: "holdipo", type: "website", images: [{ url: "/og.png?v=2", width: 1200, height: 630, alt: "holdipo" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png?v=2"] },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>
        <WalletProvider>
          <StatusProvider>
            <Nav />
            <main>{children}</main>
            <Footer />
            <WalletPicker />
          </StatusProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
