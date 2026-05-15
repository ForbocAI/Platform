import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import BootstrapGate from "./BootstrapGate";

export const metadata: Metadata = {
  metadataBase: new URL("https://platform.forboc.ai"),
  title: "Lanternbough | Platform.Forboc.ai",
  description: "A cozy fantasy world prototype for living characters, companions, and story-rich play. Powered by Forboc AI.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lanternbough | Forboc Platform",
    description: "A cozy fantasy world prototype for living characters and companions.",
    url: "https://platform.forboc.ai",
    siteName: "Lanternbough",
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
    title: "Lanternbough | Forboc Platform",
    description: "A cozy fantasy world prototype for living characters and companions.",
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
      "name": "Lanternbough Platform",
      "operatingSystem": "Web",
      "applicationCategory": "GameApplication",
      "description": "Cozy fantasy RPG platform powered by Forboc AI.",
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
        <meta name="theme-color" content="#263127" />
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
      <body className="font-sans antialiased bg-palette-bg-dark">
        <StoreProvider>
          <BootstrapGate>{children}</BootstrapGate>
        </StoreProvider>
      </body>
    </html>
  );
}
