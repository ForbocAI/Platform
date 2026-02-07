import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "QUA'DAR | Platform.Forboc.ai",
  description: "A Cyber-Grimdark RPG Experience in the Qua'dar Universe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-D999WBQEXY" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-D999WBQEXY');`}
      </Script>
      <body className={`${jetbrainsMono.variable} font-mono antialiased overflow-hidden bg-zinc-950`}>
        {children}
      </body>
    </html>
  );
}
