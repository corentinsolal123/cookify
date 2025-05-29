// components/recipes/RecipePageHeader.tsx - AVEC auth conditionnelle
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { SearchAndFiltersHeader } from "./SearchAndFiltersHeader";
import { TagData } from "@/types/tag";
import { SearchFilters } from "@/types/search";

interface RecipePageHeaderProps {
    title: string;
    subtitle?: string;
    recipeCount: number;
    allTags: TagData[];
    currentFilters: SearchFilters;
}

export default async function RecipePageHeader({
                                                   title,
                                                   subtitle,
                                                   recipeCount,
                                                   allTags,
                                                   currentFilters
                                               }: RecipePageHeaderProps) {
    // Récupérer la session côté serveur

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-8 pb-6">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="flex gap-6">
                    {/* Titre et bouton créer (si connecté) */}
                    <div className="flex md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            {subtitle && (
                                <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
                            )}
                        </div>

                        {/* Bouton créer seulement si connecté */}
                        {(
                            <Button
                                as={NextLink}
                                href="/recipes/edit/new"
                                color="primary"
                                variant="solid"
                                radius="full"
                                size="lg"
                                startContent={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                }
                            >
                                Créer une recette
                            </Button>
                        )}
                    </div>

                    {/* Barre de recherche et filtres intégrés */}
                    <SearchAndFiltersHeader
                        allTags={allTags}
                        currentFilters={currentFilters}
                        totalResults={recipeCount}
                    />
                </div>
            </div>
        </div>
    );
}