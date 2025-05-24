// app/recipes/page.tsx (Server Component)
import RecipePageHeader from "@/components/recipes/RecipePageHeader";
import RecipeList from "@/components/recipes/RecipeList";
import { getAllRecipes } from "@/services/recipeServices";

type Props = {
    params: Promise<{}>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RecipesPage({ params, searchParams }: Props) {
    await params;
    const resolvedSearchParams = await searchParams;

    // ✅ Server-side data fetching
    const recipes = await getAllRecipes();

    return (
        <main className="pb-6 h-full w-full">
            <RecipePageHeader
                title="Liste des recettes"
                subtitle={`${recipes.length} recette${recipes.length > 1 ? 's' : ''} disponible${recipes.length > 1 ? 's' : ''}`}
            />
            <RecipeList recipes={recipes} />
        </main>
    );
}