import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loged.in — Document Your Journey. Inspire Others.",
  description: "Loged.in helps you track personal milestones, document your transformation, and share your progress with the world. Private by default, powerful when shared.",
  keywords: ["transformation tracking", "journey tracker", "personal milestones", "progress log", "self-improvement tracker", "milestone app", "progress journal"],
  openGraph: {
    title: "Loged.in — Track Your Milestones & Transformations",
    description: "Document your journey privately or publicly. Stay accountable. Inspire others.",
    url: "https://loged.in",
    siteName: "Loged.in",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Loged.in — Track Your Milestones & Transformations",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loged.in — Document Your Transformation",
    description: "Track milestones. Share progress. Inspire others.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://loged.in"),
}; 