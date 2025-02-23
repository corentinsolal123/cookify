"use client";

import { Avatar, Badge, Card, CardBody, CardHeader } from "@heroui/react";
import { RecipeData } from "@/types/recipe";
import { ReactElement } from "react";

interface RecipeDetailProps {
    recipe: RecipeData;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps): ReactElement{
    return (
        <div className="container mx-auto p-6 grid grid-cols-12 gap-6">
            {/* Image et infos pratiques */}
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardBody className="p-4">
                        <img
                            src={recipe.image || "/placeholder.png"}
                            alt={recipe.name}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 space-y-2">
                        <Badge>{recipe.difficulty}</Badge>
                        <p>⏱ Préparation : {recipe.prepTime} min</p>
                        <p>🔥 Cuisson : {recipe.cookTime} min</p>
                        <p>⚡ Calories : {recipe.calories} kcal</p>
                        <div className="flex items-center space-x-2">
                            <Avatar size="sm" />
                            <span>Par {recipe.creator}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Étapes de préparation */}
            <div className="col-span-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">Étapes de préparation</h2>
                    </CardHeader>
                    <CardBody>
                        <ol className="list-decimal list-inside space-y-2">
                            {recipe.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ol>
                    </CardBody>
                </Card>
            </div>

            {/* Liste des ingrédients */}
            <div className="col-span-3">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">Ingrédients</h2>
                    </CardHeader>
                    <CardBody>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>{ingredient.name}</span>
                                    <span>{ingredient.quantityPerServing}</span>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
