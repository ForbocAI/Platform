import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import BootstrapGate from "./BootstrapGate";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://platform.forboc.ai"),
  title: "QUA'DAR | Platform.Forboc.ai",
  description: "A Cyber-Grimdark RPG Experience in the Qua'dar Universe. Powered by Forboc AI.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "QUA'DAR | Forboc Platform",
    description: "A Cyber-Grimdark RPG Experience.",
    url: "https://platform.forboc.ai",
    siteName: "Qua'dar",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QUA'DAR | Forboc Platform",
    description: "A Cyber-Grimdark RPG Experience.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://forboc.ai/#organization",
      "name": "ForbocAI",
      "url": "https://forboc.ai",
      "logo": "https://forboc.ai/logo.png"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Qua'dar Platform",
      "operatingSystem": "Web",
      "applicationCategory": "GameApplication",
      "description": "Cyber-grimdark RPG platform powered by Forboc AI.",
      "url": "https://platform.forboc.ai",
      "publisher": {
        "@id": "https://forboc.ai/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#131313" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-D999WBQEXY" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-D999WBQEXY');`}
      </Script>
      <body className={`${jetbrainsMono.variable} font-mono antialiased overflow-hidden bg-zinc-950`}>
        <StoreProvider>
          <BootstrapGate>{children}</BootstrapGate>
        </StoreProvider>
      </body>
    </html>
  );
}
