import { IngredientData } from "@/types/ingredient";

export interface RecipeData {
    _id?: string; // champ optionnel
    image?: string;
    tags?: string[];
    name: string;
    description: string;
    difficulty: string;
    prepTime: number;
    cookTime: number;
    calories: number;
    creator: string;
    steps: string[];
    servings: number;
    ingredients: IngredientData[];
}


