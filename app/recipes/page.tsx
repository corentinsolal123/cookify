// app/recipes/page.tsx

import RecipeListWrapper from "@/components/recipes/RecipeListWrapper";
import RecipePageHeader from "@/components/recipes/RecipePageHeader";
import { getAllRecipes } from "@/services/recipeServices";

type Props = {
    params: Promise<{}>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RecipesPage({ params, searchParams }: Props) {
    // Attendre les paramètres (même si params est vide ici)
    await params;
    const resolvedSearchParams = await searchParams;

    // Fetch recipes data server-side
    const recipes = await getAllRecipes();

    return (
        <main className="pb-6 h-full w-full">
            <RecipePageHeader title="Liste des recettes" />
            <RecipeListWrapper recipes={recipes} />
        </main>
    );
}