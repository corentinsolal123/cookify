// components/recipes/RecipePageHeader.tsx (Server Component maintenant !)
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { SearchInput } from "./SearchInput"; // ← Nouveau composant client pour la search

interface RecipePageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function RecipePageHeader({ title, subtitle }: RecipePageHeaderProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-8 pb-6">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        {/* ✅ Search séparée en client component */}
                        <SearchInput />

                        <Button
                            as={NextLink}
                            href="/recipes/edit/new"
                            color="primary"
                            variant="solid"
                            radius="full"
                            startContent={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            }
                        >
                            Créer une recette
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}