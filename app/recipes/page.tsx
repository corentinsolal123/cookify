// app/recipes/supabase/page.tsx - NOUVELLE VERSION SUPABASE
import RecipePageHeader from "@/components/recipes/RecipePageHeader";
import RecipeList from "@/components/recipes/RecipeList";
import { SearchFilters } from "@/types/search";
import { getAllRecipes } from "@/lib/services/server/recipeServices";
import { getAllTagsServer } from "@/lib/services/server/tagServices";

type Props = {
    params: Promise<{}>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RecipesSupabasePage({ params, searchParams }: Readonly<Props>) {
    await params;
    const resolvedSearchParams = await searchParams;

    // Construire les filtres depuis les URL params (identique à ton code)
    const filters: SearchFilters = {
        search: typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined,
        tags: typeof resolvedSearchParams.tags === "string"
            ? resolvedSearchParams.tags.split(",").filter(Boolean)
            : undefined,
        difficulty: typeof resolvedSearchParams.difficulty === "string" ? resolvedSearchParams.difficulty : undefined,
        maxPrepTime: resolvedSearchParams.maxPrepTime ? Number(resolvedSearchParams.maxPrepTime) : undefined,
        maxCookTime: resolvedSearchParams.maxCookTime ? Number(resolvedSearchParams.maxCookTime) : undefined,
        page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1,
        limit: 12
    };

    try {
        // Fetch data server-side avec Supabase
        const [recipesResult, allTags] = await Promise.all([
            getAllRecipes(filters),
            getAllTagsServer()
        ]);

        const { recipes, total, page, totalPages } = recipesResult;

        return (
            <main className="pb-6 h-full w-full">
                {/* Indicateur Supabase temporaire */}
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    🚀 Cette page utilise Supabase ! ({recipes.length} recettes)
                </div>

                {/* Header avec filtres intégrés */}
                <RecipePageHeader
                    title="Liste des recettes"
                    subtitle={`${total} recette${total > 1 ? "s" : ""} ${filters.search ? `pour "${filters.search}"` : "disponible" + (total > 1 ? "s" : "")}`}
                    recipeCount={total}
                    allTags={allTags}
                    currentFilters={filters}
                />

                {/* Liste des recettes */}
                <RecipeList
                    recipes={recipes}
                    currentPage={page}
                    totalPages={totalPages}
                    hasFilters={!!(filters.search || filters.tags?.length || filters.difficulty || filters.maxPrepTime || filters.maxCookTime)}
                />
            </main>
        );
    } catch (error) {
        console.error("Erreur page recipes:", error);

        // Fallback d'erreur
        return (
            <main className="pb-6 h-full w-full">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    ❌ Erreur lors du chargement des recettes
                </div>
            </main>
        );
    }
}