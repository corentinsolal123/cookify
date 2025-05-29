import { IngredientData } from "@/types/ingredient";

// types/recipe.ts
export interface RecipeData {
    id?: string; // UUID au lieu de _id
    user_id?: string; // Ajouté pour la relation avec auth.users
    name: string;
    description?: string;
    difficulty: 'facile' | 'moyen' | 'difficile'; // Plus strict
    prep_time: number; // en minutes
    cook_time: number; // en minutes
    calories?: number;
    creator: string;
    steps: string[];
    servings: number;
    ingredients: IngredientData[];
    tags?: string[]; // Array de noms de tags
    image?: string;
    created_at?: string;
    updated_at?: string;
}