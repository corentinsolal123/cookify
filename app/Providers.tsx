"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: any;
}

export function Providers({ children, themeProps }: ProvidersProps) {
    const router = useRouter();

    return (
        <HeroUIProvider navigate={router.push}>
            <NextThemesProvider {...themeProps}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
