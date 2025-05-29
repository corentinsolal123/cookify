// components/recipes/RecipeNutrition.tsx
"use client";

import { useState, useEffect } from "react";
import { Activity, Loader2, RefreshCw } from "lucide-react";
import { IngredientData } from "@/types/ingredient";

interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
}

interface RecipeNutritionProps {
    ingredients: IngredientData[];
    servings: number;
    totalCalories?: number;
}

export default function RecipeNutrition({ ingredients, servings, totalCalories }: Readonly<RecipeNutritionProps>) {
    const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour récupérer les données nutritionnelles via API externe
    const fetchNutritionData = async () => {
        if (ingredients.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            // Appel à ton API qui va interroger l'API externe (ex: Edamam, USDA, etc.)
            const response = await fetch("/api/nutrition/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ingredients: ingredients.map(ing => ({
                        name: ing.name,
                        quantity: ing.quantityPerServing,
                        unit: ing.unit
                    })),
                    servings
                })
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données nutritionnelles");
            }

            const data = await response.json();
            setNutritionData(data);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    // Chargement automatique au montage du composant
    useEffect(() => {
        fetchNutritionData();
    }, [ingredients, servings]);

    // Fonction pour calculer les pourcentages (basé sur les apports journaliers recommandés)
    const getPercentage = (value: number, dailyValue: number) => {
        return Math.round((value / dailyValue) * 100);
    };

    // Valeurs journalières recommandées (exemple pour un adulte)
    const dailyValues = {
        calories: 2000,
        protein: 50,
        carbs: 300,
        fat: 70,
        fiber: 25,
        sodium: 2300
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">

            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        Informations nutritionnelles
                    </h2>
                </div>

                <button
                    onClick={fetchNutritionData}
                    disabled={loading}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    aria-label="Actualiser les données nutritionnelles"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* États de chargement/erreur */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-600">
            Analyse nutritionnelle en cours...
          </span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                        onClick={fetchNutritionData}
                        className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Données nutritionnelles */}
            {nutritionData && !loading && (
                <div className="space-y-4">

                    {/* Calories principales */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Calories par portion</span>
                            <span className="text-2xl font-bold text-blue-600">
                {Math.round(nutritionData.calories / servings)}
              </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                            Total: {Math.round(nutritionData.calories)} cal
                        </div>
                    </div>

                    {/* Macronutriments */}
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Macronutriments (par portion)</h3>

                        {[
                            {
                                name: "Protéines",
                                value: nutritionData.protein / servings,
                                unit: "g",
                                color: "bg-red-500",
                                dailyValue: dailyValues.protein
                            },
                            {
                                name: "Glucides",
                                value: nutritionData.carbs / servings,
                                unit: "g",
                                color: "bg-yellow-500",
                                dailyValue: dailyValues.carbs
                            },
                            {
                                name: "Lipides",
                                value: nutritionData.fat / servings,
                                unit: "g",
                                color: "bg-purple-500",
                                dailyValue: dailyValues.fat
                            }
                        ].map((macro, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">{macro.name}</span>
                                    <span className="text-sm font-medium">
                    {Math.round(macro.value)}{macro.unit}
                  </span>
                                </div>

                                {/* Barre de progression */}
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${macro.color}`}
                                        style={{
                                            width: `${Math.min(getPercentage(macro.value, macro.dailyValue), 100)}%`
                                        }}
                                    />
                                </div>

                                <div className="text-xs text-gray-500">
                                    {getPercentage(macro.value, macro.dailyValue)}% des apports journaliers
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Autres nutriments */}
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                        <h3 className="font-medium text-gray-900">Autres nutriments (par portion)</h3>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fibres</span>
                                <span className="font-medium">{Math.round(nutritionData.fiber / servings)}g</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Sucres</span>
                                <span className="font-medium">{Math.round(nutritionData.sugar / servings)}g</span>
                            </div>

                            <div className="flex justify-between col-span-2">
                                <span className="text-gray-600">Sodium</span>
                                <span className="font-medium">{Math.round(nutritionData.sodium / servings)}mg</span>
                            </div>
                        </div>
                    </div>

                    {/* Note sur les données */}
                    <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            * Les valeurs nutritionnelles sont approximatives et peuvent varier selon les ingrédients
                            utilisés.
                            Données fournies par API nutritionnelle externe.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}