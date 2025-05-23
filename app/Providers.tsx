"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: any;
}

export function Providers({ children, themeProps }: ProvidersProps) {
    const router = useRouter();

    return (
        <HeroUIProvider navigate={router.push}>
            <NextThemesProvider {...themeProps}>
                <SessionProvider>{children}</SessionProvider>
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
