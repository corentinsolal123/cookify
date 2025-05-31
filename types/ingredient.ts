// types/ingredient.ts
export interface IngredientData {
    name: string;
    quantityPerServing: number;
    unit: string;
    calories: number;
    // Nouvelles propriétés nutritionnelles (valeurs pour 100g)
    proteins: number;
    carbs: number;
    fat: number;
    fiber: number;
}

// Type pour la création/mise à jour (certains champs optionnels)
export interface CreateIngredientInput {
    name: string;
    quantityPerServing: number;
    unit: string;
    calories: number;
    proteins?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
}

// Type pour les suggestions d'API externe (OpenFoodFacts)
export interface NutritionalInfo {
    calories: number;
    proteins?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugars?: number;
    salt?: number;
}