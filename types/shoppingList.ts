// types/shoppingList.ts
import { RecipeData } from "@/types/recipe";

export interface ShoppingListItemData {
    id?: string;
    shopping_list_id?: string;
    ingredient_id?: string;
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ShoppingListData {
    id?: string;
    user_id?: string;
    name: string;
    recipes: string[];
    created_at?: string;
    updated_at?: string;
    items?: ShoppingListItemData[];
    recipe_details?: RecipeData[];
}
