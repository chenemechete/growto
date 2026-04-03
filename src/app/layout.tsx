import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrowTo — Practice Relationship Skills",
  description:
    "Practice relationship skills before the stakes are high. AI-powered daily scenarios, personalized to your patterns.",
  keywords: ["relationship skills", "attachment", "emotional regulation", "boundaries"],
  openGraph: {
    title: "GrowTo — Practice Relationship Skills",
    description: "Practice relationship skills before the stakes are high.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-light text-dark">
        {children}
      </body>
    </html>
  );
}
