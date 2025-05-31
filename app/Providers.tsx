"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import QueryProvider from "@/lib/providers/QueryProvider";

export interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: any;
}

export function Providers({ children, themeProps }: Readonly<ProvidersProps>) {
    const router = useRouter();

    return (
        <HeroUIProvider navigate={router.push} locale={"fr-FR"}>
            <NextThemesProvider {...themeProps}>
                <AuthProvider>
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </AuthProvider>
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
