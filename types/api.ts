// types/api.ts - Nouveaux types pour les réponses API
export interface SearchResponse<T> {
    data: T[];
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Request types pour les API (inchangés)
export interface AddRecipeToShoppingListRequest {
    recipeId: string;
    servings?: number;
}

export interface UpdateShoppingListItemRequest {
    itemId: string;
    checked?: boolean;
    quantity?: number;
}