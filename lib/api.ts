import { RecipeData } from "@/types/recipe";
import { IngredientData } from "@/types/ingredient";

// Pour récupérer la liste des recettes
export async function fetchRecipesAPI(): Promise<RecipeData[]> {
    const res = await fetch("/api/recipes");

    if (!res.ok) {
        throw new Error("Erreur lors du fetch des recettes");
    }

    return res.json();
}

// Pour récupérer la liste des recettes
export async function fetchIngredientsAPI(): Promise<IngredientData[]> {
    const res = await fetch("/api/ingredients");

    if (!res.ok) {
        throw new Error("Erreur lors du fetch des ingrédients");
    }

    return res.json();
}

// Pour créer une nouvelle recette
// On utilise Omit<IRecipe, "_id"> car la nouvelle recette n'a pas encore d'ID
export async function createRecipeAPI(
    newRecipe: Omit<RecipeData, "_id">
): Promise<RecipeData> {
    const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipe)
    });

    if (!res.ok) {
        throw new Error("Erreur lors de la création de la recette");
    }

    return res.json();
}
