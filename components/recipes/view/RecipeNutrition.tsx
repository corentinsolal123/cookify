// components/recipes/view/RecipeNutrition.tsx
"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { IngredientData } from "@/types/ingredient";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

interface NutritionData {
    calories: number;
    proteins: number;
    carbs: number;
    fat: number;
    fiber: number;
}

interface RecipeNutritionProps {
    ingredients: IngredientData[];
    servings: number;
    totalCalories?: number;
}

export default function RecipeNutrition({
                                            ingredients,
                                            servings,
                                            totalCalories
                                        }: Readonly<RecipeNutritionProps>) {

    // Calcul des valeurs nutritionnelles totales à partir des ingrédients
    const nutritionData = useMemo((): NutritionData => {
        const calculatedNutrition = ingredients.reduce((total, ingredient) => {
            // Conversion en fonction de la quantité par portion
            // Les valeurs dans ingredient sont pour 100g, on les adapte à la quantité réelle
            const conversionFactor = ingredient.quantityPerServing / 100;

            return {
                calories: total.calories + (ingredient.calories * conversionFactor),
                proteins: total.proteins + (ingredient.proteins * conversionFactor),
                carbs: total.carbs + (ingredient.carbs * conversionFactor),
                fat: total.fat + (ingredient.fat * conversionFactor),
                fiber: total.fiber + (ingredient.fiber * conversionFactor)
            };
        }, {
            calories: 0,
            proteins: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        });

        // Utilise les calories stockées en BDD si disponibles, sinon les calculées
        return {
            ...calculatedNutrition,
            calories: totalCalories || calculatedNutrition.calories
        };
    }, [ingredients, totalCalories]);

    // Fonction pour calculer les pourcentages (basé sur les apports journaliers recommandés)
    const getPercentage = (value: number, dailyValue: number): number => {
        return Math.round((value / dailyValue) * 100);
    };

    // Valeurs journalières recommandées (pour un adulte)
    const dailyValues = {
        calories: 2000,
        proteins: 50, // en grammes
        carbs: 300,   // en grammes
        fat: 70,      // en grammes
        fiber: 25    // en grammes
    };

    // Configuration des macronutriments avec couleurs HeroUI
    const macronutrients = [
        {
            name: "Protéines",
            value: nutritionData.proteins / servings,
            unit: "g",
            color: "danger" as const,
            dailyValue: dailyValues.proteins
        },
        {
            name: "Glucides",
            value: nutritionData.carbs / servings,
            unit: "g",
            color: "warning" as const,
            dailyValue: dailyValues.carbs
        },
        {
            name: "Lipides",
            value: nutritionData.fat / servings,
            unit: "g",
            color: "secondary" as const,
            dailyValue: dailyValues.fat
        },
        {
            name: "Fibres",
            value: nutritionData.fiber / servings,
            unit: "g",
            color: "success" as const,
            dailyValue: dailyValues.fiber
        }
    ];

    // Calcul de la répartition calorique
    const calorieBreakdown = useMemo(() => {
        const proteinCals = (nutritionData.proteins / servings) * 4; // 4 cal/g
        const carbCals = (nutritionData.carbs / servings) * 4;       // 4 cal/g
        const fatCals = (nutritionData.fat / servings) * 9;          // 9 cal/g
        const totalMacroCals = proteinCals + carbCals + fatCals;

        if (totalMacroCals === 0) return null;

        return {
            proteins: Math.round((proteinCals / totalMacroCals) * 100),
            carbs: Math.round((carbCals / totalMacroCals) * 100),
            fat: Math.round((fatCals / totalMacroCals) * 100)
        };
    }, [nutritionData, servings]);

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-success" />
                    <h2 className="text-xl font-semibold">
                        Informations nutritionnelles
                    </h2>
                </div>
            </CardHeader>

            <CardBody className="space-y-6">
                {/* Calories principales - Card mise en évidence */}
                <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200">
                    <CardBody className="py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-primary-700">
                                    Calories par portion
                                </p>
                                <p className="text-xs text-primary-600">
                                    Total: {Math.round(nutritionData.calories)} cal
                                    pour {servings} portion{servings > 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-primary">
                                    {Math.round(nutritionData.calories / servings)}
                                </span>
                                <span className="text-sm text-primary-600 ml-1">cal</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Macronutriments avec Progress bars HeroUI */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                        Macronutriments (par portion)
                    </h3>

                    <div className="space-y-4">
                        {macronutrients.map((macro, index) => {
                            const percentage = getPercentage(macro.value, macro.dailyValue);

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-foreground">
                                            {macro.name}
                                        </span>
                                        <Chip
                                            color={macro.color}
                                            variant="flat"
                                            size="sm"
                                        >
                                            {macro.value.toFixed(1)}{macro.unit}
                                        </Chip>
                                    </div>

                                    <Progress
                                        value={Math.min(percentage, 100)}
                                        color={macro.color}
                                        size="md"
                                        className="w-full"
                                        aria-label={`${macro.name} progress`}
                                    />

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-default-500">
                                            {percentage}% des apports journaliers
                                        </span>
                                        <span className="text-xs text-default-400">
                                            /{macro.dailyValue}g
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Divider />

                {/* Répartition calorique avec Chips colorés */}
                {calorieBreakdown && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground">
                            Répartition calorique
                        </h3>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <Chip
                                color="danger"
                                variant="dot"
                            >
                                Protéines {calorieBreakdown.proteins}%
                            </Chip>
                            <Chip
                                color="warning"
                                variant="dot"
                            >
                                Glucides {calorieBreakdown.carbs}%
                            </Chip>
                            <Chip
                                color="secondary"
                                variant="dot"
                            >
                                Lipides {calorieBreakdown.fat}%
                            </Chip>
                        </div>
                    </div>
                )}

                <Divider />

                <div className="p-3 bg-default-50 rounded-lg border border-default-200">
                    <p className="text-xs text-default-600 leading-relaxed">
                        <span className="font-medium">Note :</span> Les valeurs nutritionnelles sont calculées à partir
                        des ingrédients stockés.
                        Les valeurs peuvent varier selon les marques et méthodes de préparation utilisées.
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}