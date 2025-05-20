// app/recipes/page.tsx

import RecipeListWrapper from "@/components/recipes/RecipeListWrapper";
import RecipePageHeader from "@/components/recipes/RecipePageHeader";
import { getAllRecipes } from "@/services/recipeServices";

export default async function RecipesPage() {
    // Fetch recipes data server-side
    const recipes = await getAllRecipes();

    return (
        <main className="pb-6 h-full w-full">
            <RecipePageHeader title="Liste des recettes" />
            <RecipeListWrapper recipes={recipes} />
        </main>
    );
}
