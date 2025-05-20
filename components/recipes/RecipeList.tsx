"use client";

import { RecipeData } from "@/types/recipe";
import { Card, CardBody, CardHeader, CardFooter, Divider, Link, Chip, Button } from "@heroui/react";
import NextLink from "next/link";

interface RecipeListProps {
    recipes: RecipeData[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center max-w-md">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucune recette disponible</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Commencez par créer votre première recette pour la voir apparaître ici.</p>
                    <Button 
                        as={NextLink} 
                        href="/recipes/create" 
                        color="primary" 
                        className="font-medium"
                        startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        }
                    >
                        Créer une recette
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="recipe-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            {recipes.map((recipe) => (
                <Card
                    key={recipe._id}
                    as={NextLink}
                    href={`/recipes/${recipe._id}`}
                    isPressable
                    isHoverable
                    className="card-custom border border-gray-200 dark:border-gray-700 h-full"
                >
                    <CardHeader className="flex flex-col gap-1 pb-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">{recipe.name}</h3>
                            {recipe.difficulty && (
                                <Chip 
                                    size="sm" 
                                    variant="flat" 
                                    color={
                                        recipe.difficulty === "Facile" ? "success" : 
                                        recipe.difficulty === "Moyen" ? "warning" : 
                                        "danger"
                                    }
                                >
                                    {recipe.difficulty}
                                </Chip>
                            )}
                        </div>
                    </CardHeader>
                    <Divider className="my-3" />
                    <CardBody>
                        {recipe.description ? (
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                                {recipe.description}
                            </p>
                        ) : (
                            <p className="italic text-gray-500 dark:text-gray-400">Aucune description</p>
                        )}
                    </CardBody>
                    <CardFooter className="flex flex-col items-start gap-2 pt-0">
                        <div className="flex flex-wrap gap-1">
                            {recipe.ingredients && recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                                <Chip 
                                    key={index} 
                                    size="sm" 
                                    variant="flat" 
                                    color="secondary"
                                    className="text-xs"
                                >
                                    {ingredient.name}
                                </Chip>
                            ))}
                            {recipe.ingredients && recipe.ingredients.length > 3 && (
                                <Chip size="sm" variant="flat" color="default" className="text-xs">
                                    +{recipe.ingredients.length - 3}
                                </Chip>
                            )}
                        </div>
                        <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {recipe.prepTime && (
                                <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {recipe.prepTime} min
                                </span>
                            )}
                            {recipe.servings && (
                                <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {recipe.servings} {recipe.servings > 1 ? 'personnes' : 'personne'}
                                </span>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
