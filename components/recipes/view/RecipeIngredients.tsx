// components/recipes/RecipeIngredients.tsx
'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { IngredientData } from '@/types/ingredient';

interface RecipeIngredientsProps {
    ingredients: IngredientData[];
    servings: number;
}

export default function RecipeIngredients({
                                              ingredients,
                                              servings: defaultServings
                                          }: RecipeIngredientsProps) {
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
        <div className="bg-white rounded-lg shadow-md p-6">

            {/* En-tête avec ajustement des portions */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Ingrédients
                </h2>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Portions:</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => adjustServings(-1)}
                            disabled={currentServings <= 1}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            aria-label="Diminuer le nombre de portions"
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-8 text-center font-medium">
              {currentServings}
            </span>

                        <button
                            onClick={() => adjustServings(1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            aria-label="Augmenter le nombre de portions"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des ingrédients */}
            <div className="space-y-3 mb-6">
                {ingredients.map((ingredient, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex-1">
              <span className="font-medium text-gray-900">
                {ingredient.name}
              </span>
                            {ingredient.calories > 0 && (
                                <span className="ml-2 text-xs text-gray-500">
                  ({Math.round(ingredient.calories * ratio)} cal)
                </span>
                            )}
                        </div>

                        <div className="text-right">
              <span className="font-medium text-gray-900">
                {formatQuantity(ingredient.quantityPerServing)} {ingredient.unit}
              </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bouton d'ajout à la liste de courses */}
            <button
                onClick={addToShoppingList}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
                <ShoppingCart className="w-4 h-4" />
                Ajouter à ma liste de courses
            </button>

            {/* Informations nutritionnelles rapides */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Calories totales:</span>
                    <span className="font-medium">
            {Math.round(ingredients.reduce((total, ing) =>
                total + (ing.calories * ratio), 0
            ))} cal
          </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Par portion:</span>
                    <span className="font-medium">
            {Math.round(ingredients.reduce((total, ing) =>
                total + (ing.calories * ratio), 0
            ) / currentServings)} cal
          </span>
                </div>
            </div>
        </div>
    );
}