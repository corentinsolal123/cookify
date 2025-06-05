export type SiteConfig = typeof siteConfig;

// @ts-ignore
export const siteConfig = {
    name: "Cookify",
    description: "C'est mon site de recettes.",
    navItems: [
        {
            label: "Recipes",
            href: "/recipes"
        },
        {
            label: "Shopping List",
            href: "/shopping-list"
        }
    ],
};
