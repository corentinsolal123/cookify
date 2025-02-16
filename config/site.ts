export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "Cookify",
    description: "C'est mon site de recettes hihiiii.",
    navItems: [
        {
            label: "Recipes",
            href: "/recipes"
        },
        {
            label: "About",
            href: "/about"
        }
    ],
    navMenuItems: [
        {
            label: "Profile",
            href: "/profile"
        },
        {
            label: "Settings",
            href: "/settings"
        },
        {
            label: "Logout",
            href: "/logout"
        }
    ],
    links: {
        github: "https://github.com/heroui-inc/heroui",
        twitter: "https://twitter.com/hero_ui",
        docs: "https://heroui.com",
        discord: "https://discord.gg/9b6yyZKmH4",
        sponsor: "https://patreon.com/jrgarciadev"
    }
};
