"use client";

import { IRecipe } from "@/types/recipe";
import { Card, CardBody, CardHeader, Divider, Link } from "@heroui/react";

interface RecipeListProps {
    recipes: IRecipe[];
}

export default function RecipeList({ recipes }: RecipeListProps) {
    if (recipes.length === 0) {
        return <p className="text-center text-gray-600">Aucune recette disponible.</p>;
    }

    return (
        <div className="recipe-list flex flex-col gap-6 items-center">
            {recipes.map((recipe) => (
                <Link key={recipe._id} href={`/recipes/${recipe._id}`}>
                    <Card
                        isBlurred
                        className="border-none bg-background/60 dark:bg-default-100/50 w-full max-w-[610px]"
                        shadow="sm"
                    >
                        <CardHeader className="flex flex-col gap-1">
                            <h3 className="text-xl font-bold">{recipe.name}</h3>
                        </CardHeader>
                        <Divider className="my-4" />
                        <CardBody>
                            {recipe.description ? (
                                <p className="mb-2 text-base text-gray-700 dark:text-gray-300">
                                    {recipe.description}
                                </p>
                            ) : (
                                <p className="mb-2 italic text-gray-500">Aucune description</p>
                            )}
                            <p className="text-sm text-gray-600">
                                <strong>Étapes :</strong> {recipe.steps.join(", ")}
                            </p>
                        </CardBody>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
