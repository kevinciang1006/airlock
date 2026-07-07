import type { Metadata } from "next";
import { Toaster } from "@/components/toast/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airlock — Multi-tenant SaaS console",
  description:
    "A multi-tenant SaaS console with database-enforced tenant isolation. Row-level security on every query, scoped to the org you're acting in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded via <link> (not next/font) so the production build
          never has to fetch font files at build time. Space Grotesk = display,
          Inter = body/UI, IBM Plex Mono = identifiers. Matches the design comp.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
