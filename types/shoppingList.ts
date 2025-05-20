import { IngredientData } from "@/types/ingredient";
import { RecipeData } from "@/types/recipe";

export interface ShoppingListItemData {
    _id?: string;
    ingredient?: string; // ID of the ingredient
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
}

export interface ShoppingListData {
    _id?: string;
    userId: string;
    name: string;
    items: ShoppingListItemData[];
    recipes: string[] | RecipeData[]; // Array of recipe IDs or full recipe objects
    createdAt?: Date;
    updatedAt?: Date;
}

// Request types for API endpoints
export interface AddRecipeToShoppingListRequest {
    recipeId: string;
    servings?: number; // Optional servings multiplier
}

export interface UpdateShoppingListItemRequest {
    itemId: string;
    checked?: boolean;
    quantity?: number;
}