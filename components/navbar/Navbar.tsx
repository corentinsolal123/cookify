// components/navbar/Navbar.tsx (Server Component)
import { Kbd } from "@heroui/kbd";
import { Input } from "@heroui/input";
import {
    Navbar as HeroUINavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuToggle
} from "@heroui/navbar";
import NextLink from "next/link";
import { siteConfig } from "@/config/site";
import { Logo, SearchIcon } from "@/components/global/Icons";
import { ThemeSwitch } from "@/components/global/Theme-switch";
import { NavLinks } from "@/components/navbar/NavLinks";
import AuthStatus from "@/components/auth/AuthStatus";

export const Navbar = () => {
    const searchInput = (
        <Input
            aria-label="Search"
            classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-800 border-0",
                input: "text-sm"
            }}
            endContent={<Kbd className="hidden lg:inline-block" keys={["command"]}>K</Kbd>}
            labelPlacement="outside"
            placeholder="Search recipes..."
            startContent={
                <SearchIcon className="text-base text-gray-500 dark:text-gray-400 pointer-events-none flex-shrink-0" />
            }
            type="search"
            size="sm"
            radius="lg"
        />
    );

    return (
        <HeroUINavbar
            maxWidth="xl"
            position="sticky"
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
            shouldHideOnScroll
        >
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-2" href="/">
                        <Logo className="text-primary-600 dark:text-primary-400" />
                        <p className="font-bold text-xl text-gray-900 dark:text-white">{siteConfig.name}</p>
                    </NextLink>
                </NavbarBrand>

                <NavLinks />
            </NavbarContent>

            <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
                <NavbarItem className="hidden lg:flex w-64">{searchInput}</NavbarItem>
                <NavbarItem className="ml-2">
                    <AuthStatus />
                </NavbarItem>
                <NavbarItem className="ml-2">
                    <ThemeSwitch />
                </NavbarItem>
            </NavbarContent>

            <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
                <ThemeSwitch />
                <NavbarMenuToggle />
            </NavbarContent>

            <NavbarMenu className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md pt-6 pb-6">
                <div className="mx-4 mt-2 mb-6">
                    {searchInput}
                </div>
                <NavLinks isMobile />
            </NavbarMenu>
        </HeroUINavbar>
    );
};