// components/recipes/RecipeIngredients.tsx
'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { IngredientData } from '@/types/ingredient';
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from '@heroui/divider';

interface RecipeIngredientsProps {
    ingredients: IngredientData[];
    servings: number;
}

export default function RecipeIngredients({
                                              ingredients,
                                              servings: defaultServings
                                          }: Readonly<RecipeIngredientsProps>) {
    // État pour ajuster le nombre de portions
    const [currentServings, setCurrentServings] = useState(defaultServings);

    // Calcul du ratio pour ajuster les quantités
    const ratio = currentServings / defaultServings;

    // Fonction pour ajuster les portions
    const adjustServings = (delta: number) => {
        const newServings = currentServings + delta;
        if (newServings > 0) {
            setCurrentServings(newServings);
        }
    };

    // Fonction pour formater les quantités
    const formatQuantity = (quantity: number) => {
        const adjustedQuantity = quantity * ratio;

        // Arrondir intelligemment selon la valeur
        if (adjustedQuantity < 0.1) {
            return adjustedQuantity.toFixed(2);
        } else if (adjustedQuantity < 1) {
            return adjustedQuantity.toFixed(1);
        } else {
            return Math.round(adjustedQuantity * 4) / 4; // Arrondir au quart
        }
    };

    // Fonction pour ajouter à la liste de courses
    const addToShoppingList = async () => {
        try {
            const adjustedIngredients = ingredients.map(ingredient => ({
                name: ingredient.name,
                quantity: formatQuantity(ingredient.quantityPerServing),
                unit: ingredient.unit,
                checked: false
            }));

            const response = await fetch('/api/shopping-list/add-ingredients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: adjustedIngredients,
                    servings: currentServings
                }),
            });

            if (response.ok) {
                // TODO: Afficher notification de succès
                console.log('Ingrédients ajoutés à la liste de courses');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout à la liste de courses:', error);
        }
    };

    return (
        <Card className="p-6">
            <CardHeader className="justify-between">
                <h2 className="text-xl font-semibold">
                    Ingrédients
                </h2>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Portions:</span>
                    <div className="flex items-center gap-2">
                        <Button
                            onPress={() => adjustServings(-1)}
                            disabled={currentServings <= 1}
                            aria-label="Diminuer le nombre de portions"
                            isIconOnly
                        >
                            <Minus className="w-4 h-4" />
                        </Button>

                        <span className="w-8 text-center font-medium">
                          {currentServings}
                        </span>

                        <Button
                            onPress={() => adjustServings(1)}
                            aria-label="Augmenter le nombre de portions"
                            isIconOnly
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Liste des ingrédients */}
            <CardBody className="space-y-3 mb-6">
                {ingredients.map((ingredient, index) => (
                    <Card
                        key={index}
                        className="p-3 flex flex-row items-center justify-between"
                    >
                        <div className="flex-1">
                            <span className="font-medium">
                                {ingredient.name}
                            </span>
                            {ingredient.calories > 0 && (
                                <span className="ml-2 text-xs text-gray-500">
                                    ({Math.round(ingredient.calories * ratio)} cal)
                                </span>
                            )}
                        </div>

                        <div className="text-right">
                            <span className="font-medium">
                                {formatQuantity(ingredient.quantityPerServing)} {ingredient.unit}
                            </span>
                        </div>
                    </Card>
                ))}
            </CardBody>
            {/* Bouton d'ajout à la liste de courses */}
            <Button
                startContent={<ShoppingCart className="w-4 h-4" />}
                onPress={addToShoppingList}
                className="w-full flex justify-center font-medium"
                color={"secondary"}
            >
                Ajouter à ma liste de courses
            </Button>

            <Divider className={"my-8"}/>

            {/* Informations nutritionnelles rapides */}
            <CardFooter className={"flex-col items-center justify-between"}>
                <div className="flex justify-between text-sm w-full">
                    <span className="text-gray-400">Calories totales:</span>
                    <span className="font-medium">
                        {Math.round(ingredients.reduce((total, ing) =>
                            total + (ing.calories * ratio), 0
                        ))} cal
                    </span>
                </div>
                <div className="flex justify-between text-sm mt-1 w-full">
                    <span className="text-gray-400">Par portion:</span>
                    <span className="font-medium">
                        {Math.round(ingredients.reduce((total, ing) =>
                            total + (ing.calories * ratio), 0
                        ) / currentServings)} cal
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}