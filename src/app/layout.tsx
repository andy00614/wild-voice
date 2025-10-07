import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "WildVoice - AI Voice Cloning & Text-to-Speech",
    description:
        "Transform your voice with AI. Clone voices, generate speech from text, and create realistic voice overs with WildVoice. Talk. Transform. Clone.",
    keywords: [
        "AI voice cloning",
        "text to speech",
        "voice synthesis",
        "TTS",
        "voice generator",
        "AI voice",
        "voice cloning",
        "speech synthesis",
    ],
    authors: [{ name: "WildVoice" }],
    creator: "WildVoice",
    publisher: "WildVoice",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://wildvoice.app",
        title: "WildVoice - AI Voice Cloning & Text-to-Speech",
        description:
            "Transform your voice with AI. Clone voices, generate speech from text, and create realistic voice overs.",
        siteName: "WildVoice",
    },
    twitter: {
        card: "summary_large_image",
        title: "WildVoice - AI Voice Cloning & Text-to-Speech",
        description:
            "Transform your voice with AI. Clone voices, generate speech from text, and create realistic voice overs.",
        creator: "@wildvoice",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/logo.svg",
        shortcut: "/logo.svg",
        apple: "/logo.svg",
    },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#6366f1" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
            >
                <Navigation />
                <main>{children}</main>
                <Toaster position="bottom-right" />
            </body>
        </html>
    );
}
