// components/recipes/RecipeCard.tsx (Server Component)
import { RecipeData } from "@/types/recipe";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import Image from "next/image";
import { RecipeCardActions } from "./RecipeCardActions";

interface RecipeCardProps {
    recipe: RecipeData;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'facile': return 'success';
            case 'moyen': return 'warning';
            case 'difficile': return 'danger';
            default: return 'default';
        }
    };

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

    return (
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 overflow-hidden">
            {/* Image avec overlay gradient */}
            <div className="relative h-48 overflow-hidden">
                <NextLink href={`/recipes/${recipe.id}`}>
                    {recipe.image ? (
                        <Image
                            src={recipe.image}
                            alt={recipe.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 text-orange-400 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                    )}
                </NextLink>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badge difficulté */}
                <div className="absolute top-3 left-3">
                    <Chip
                        size="sm"
                        variant="flat"
                        color={getDifficultyColor(recipe.difficulty)}
                        className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
                    >
                        {recipe.difficulty}
                    </Chip>
                </div>

                {/* Actions (favoris, etc.) */}
                <div className="absolute top-3 right-3">
                    <RecipeCardActions recipeId={recipe.id!} />
                </div>

                {/* Infos rapides en bas */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="flex gap-4 text-white text-sm">
                        {totalTime > 0 && (
                            <div className="flex items-center gap-1 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {totalTime}min
                            </div>
                        )}
                        {recipe.servings && (
                            <div className="flex items-center gap-1 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {recipe.servings}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CardBody className="p-6">
                <NextLink href={`/recipes/${recipe.id}`} className="block group-hover:text-primary-600 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                        {recipe.name}
                    </h3>
                </NextLink>

                {recipe.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                        {recipe.description}
                    </p>
                )}

                {/* Tags des ingrédients principaux */}
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.slice(0, 2).map((ingredient, index) => (
                            <Chip
                                key={index}
                                size="sm"
                                variant="flat"
                                color="secondary"
                                className="text-xs font-medium"
                            >
                                {ingredient.name}
                            </Chip>
                        ))}
                        {recipe.ingredients.length > 2 && (
                            <Chip
                                size="sm"
                                variant="flat"
                                color="default"
                                className="text-xs opacity-60"
                            >
                                +{recipe.ingredients.length - 2} ingrédients
                            </Chip>
                        )}
                    </div>
                )}

                {/* Calories si disponibles */}
                {recipe.calories && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>Calories par portion</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {Math.round(recipe.calories / (recipe.servings || 1))} kcal
                            </span>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}