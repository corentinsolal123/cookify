// types/recipe.ts
import { IngredientData } from './ingredient';

export interface RecipeData {
    id: string;
    user_id?: string;                    // ✅ Ajouté
    name: string;
    description?: string;
    difficulty: "facile" | "moyen" | "difficile";
    prep_time: number;                  // > 0 requis
    cook_time: number;                  // >= 0 autorisé
    calories: number;                   // ✅ Calculé automatiquement
    creator: string;
    steps: string[];                    // ✅ ARRAY pas jsonb
    servings: number;
    ingredients: IngredientData[];      // ✅ JSONB
    tags: string[];                     // ✅ ARRAY pas relation
    image?: string;
    created_at?: string;
    updated_at?: string;
}

// Type pour la création (sans les champs auto-générés)
export interface CreateRecipeInput {
    name: string;
    description?: string;
    difficulty: "facile" | "moyen" | "difficile";
    prep_time: number;                  // Doit être > 0
    cook_time: number;                  // Peut être 0
    servings: number;
    creator: string;
    ingredients: IngredientData[];
    steps: string[];
    tags: string[];
    image?: string;
    // user_id sera ajouté automatiquement depuis l'auth
    // calories sera calculé automatiquement
}

// Type pour la mise à jour
export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
    id: string;
}

// Type pour les filtres de recherche
export interface RecipeFilters {
    difficulty?: "facile" | "moyen" | "difficile";
    maxPrepTime?: number;
    maxCookTime?: number;
    maxCalories?: number;
    tags?: string[];
    ingredients?: string[];
}