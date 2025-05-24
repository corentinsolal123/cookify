// components/recipes/RecipeList.tsx (Server Component maintenant !)
import { RecipeData } from "@/types/recipe";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import RecipeCard from "./RecipeCard";

interface RecipeListProps {
    recipes: RecipeData[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-12 text-center max-w-lg border border-orange-100 dark:border-gray-700">
                    {/* Décoration background */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-orange-100 dark:bg-gray-700 rounded-full opacity-50"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-red-100 dark:bg-gray-600 rounded-full opacity-30"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Aucune recette pour le moment
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            Votre collection de recettes est vide. Créez votre première recette et commencez à construire votre livre de cuisine personnel !
                        </p>
                        <Button
                            as={NextLink}
                            href="/recipes/create"
                            color="primary"
                            size="lg"
                            className="font-semibold px-8"
                            startContent={
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            }
                        >
                            Créer ma première recette
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}