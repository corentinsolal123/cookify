// types/shoppingList.ts
import { RecipeData } from "@/types/recipe";

export interface ShoppingListItemData {
    id?: string; // UUID au lieu de _id
    shopping_list_id?: string; // Relation avec la liste
    ingredient_id?: string; // ID optionnel de l'ingrédient référence
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ShoppingListData {
    id?: string; // UUID au lieu de _id
    user_id?: string; // Relation avec l'utilisateur
    name: string;
    recipes: string[]; // Array d'UUIDs de recettes
    created_at?: string;
    updated_at?: string;
    // Relations chargées dynamiquement
    items?: ShoppingListItemData[];
    recipe_details?: RecipeData[];
}