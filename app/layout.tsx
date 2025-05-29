// app/layout.tsx
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "./Providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/global/Footer";
import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`
    },
    description: siteConfig.description,
    icons: {
        icon: "/favicon.ico"
    }
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" }
    ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="fr">
        <head />
        <body className={clsx("min-h-screen font-sans antialiased", fontSans.variable)}>
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
            <div
                className="fixed inset-0 bg-[#FFF5F0] bg-[url('/bg.svg')] bg-cover bg-center bg-no-repeat bg-fixed dark:bg-[#1E1B4B] -z-10"></div>
            <div className="relative flex flex-col min-h-screen">
                <Navbar />
                <main className="mx-auto w-full pb-6 flex-grow">
                    {children}
                </main>

                <Footer />
            </div>
        </Providers>
        <SpeedInsights />
        </body>
        </html>
    );
}
