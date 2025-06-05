// components/navbar/NavLinks.tsx (Client Component)
"use client";

import { NavbarItem, NavbarMenuItem } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

interface NavLinksProps {
    isMobile?: boolean;
}

export const NavLinks = ({ isMobile = false }: NavLinksProps) => {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href;

    if (isMobile) {
        return (
            <>
                {siteConfig.navItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.href}-${index}`}>
                        <NextLink
                            className={clsx(
                                "w-full font-medium text-lg text-gray-700 dark:text-gray-300",
                                isActive(item.href) && "text-primary-600 dark:text-primary-400 font-semibold"
                            )}
                            href={item.href}
                        >
                            {item.label}
                        </NextLink>
                    </NavbarMenuItem>
                ))}
            </>
        );
    }

    return (
        <ul className="hidden lg:flex gap-6 justify-start ml-6">
            {siteConfig.navItems.map((item) => (
                <NavbarItem key={item.href}>
                    <NextLink
                        className={clsx(
                            "font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2",
                            isActive(item.href) && "text-primary-600 dark:text-primary-400 font-semibold"
                        )}
                        href={item.href}
                    >
                        {item.label}
                    </NextLink>
                </NavbarItem>
            ))}
            <NavbarItem>
                <NextLink href={"/auth/login"}>
                    Login
                </NextLink>
            </NavbarItem>
            <NavbarItem>
                <NextLink href={"/auth/signup"}>
                    Signup
                </NextLink>
            </NavbarItem>
        </ul>
    );
};