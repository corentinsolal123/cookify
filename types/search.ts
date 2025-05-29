// types/search.ts
export interface SearchFilters {
    search?: string;
    tags?: string[];
    difficulty?: string;
    maxPrepTime?: number;
    maxCookTime?: number;
    page?: number;
    limit?: number;
}