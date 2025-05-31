// lib/services/searchService.ts
import { SearchResponse } from "@/types/api";
import { RecipeData } from "@/types/recipe";
import { SearchFilters } from "@/types/search";
import { createClient } from "@/lib/supabase/client";

// Définis le type de retour de ta fonction RPC
type SearchRecipeResult = RecipeData & {
    total_count: number;
};

export class SearchService {
    static async advancedSearch(filters: SearchFilters): Promise<SearchResponse<RecipeData>> {
        const { data, error } = await createClient().rpc("search_recipes", {
            search_query: filters.search ?? null,
            filter_tags: filters.tags ?? null,
            filter_difficulty: filters.difficulty ?? null,
            max_prep_time: filters.maxPrepTime ?? null,
            max_cook_time: filters.maxCookTime ?? null,
            page_limit: filters.limit ?? 20,
            page_offset: ((filters.page ?? 1) - 1) * (filters.limit ?? 20)
        }) as { data: SearchRecipeResult[] | null, error: any };

        if (error) throw error;

        const results = data ?? [];
        const totalCount = results.length > 0 ? results[0].total_count : 0;

        return {
            data: results.map(({ total_count, ...recipe }) => recipe as RecipeData),
            total_count: totalCount,
            page: filters.page ?? 1,
            limit: filters.limit ?? 20,
            has_more: totalCount > ((filters.page ?? 1) * (filters.limit ?? 20))
        };
    }
}