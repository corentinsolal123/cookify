// app/recipes/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeData } from "@/types/recipe";
import RecipeHeader from "@/components/recipes/view/RecipeHeader";
import RecipeIngredients from "@/components/recipes/view/RecipeIngredients";
import RecipeSteps from "@/components/recipes/view/RecipeSteps";
import RecipeNutrition from "@/components/recipes/view/RecipeNutrition";
import RecipeActions from "@/components/recipes/view/RecipeActions";

import { getAllRecipes, getRecipeByIdServer } from "@/lib/services/server/recipeServices";

interface PageProps {
    params: Promise<{ id: string }>; // Promise maintenant !
}

export async function generateStaticParams() {
    try {
        // Utilisation du service Supabase serveur pour récupérer toutes les recettes
        const result = await getAllRecipes({ limit: 100 });

        return result.recipes.map((recipe) => ({
            id: recipe.id
        }));
    } catch (error) {
        console.error("Erreur lors de la génération des paramètres statiques:", error);
        return [];
    }
}

// Cette fonction récupère les données de la recette
async function getRecipe(id: string): Promise<RecipeData | null> {
    try {
        // Utilisation du service Supabase serveur
        return await getRecipeByIdServer(id);
    } catch (error) {
        console.error("Erreur lors de la récupération de la recette:", error);
        return null;
    }
}

// Génération des métadonnées pour le SEO (SSG)
export async function generateMetadata({
                                           params
                                       }: PageProps): Promise<Metadata> { // ✅ Type corrigé pour utiliser PageProps
    const { id } = await params; // ✅ await obligatoire ajouté
    const recipe = await getRecipe(id);

    if (!recipe) {
        return {
            title: "Recette non trouvée - Cookify",
            description: "La recette demandée n'existe pas ou a été supprimée."
        };
    }

    return {
        title: `${recipe.name} - Cookify`,
        description: recipe.description || `Recette ${recipe.name} avec ${recipe.ingredients.length} ingrédients`,
        openGraph: {
            title: recipe.name,
            description: recipe.description || `Découvrez la recette ${recipe.name}`,
            images: recipe.image ? [
                {
                    url: recipe.image,
                    alt: `Photo de la recette ${recipe.name}`,
                    width: 1200,
                    height: 800,
                }
            ] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: recipe.name,
            description: recipe.description || `Découvrez la recette ${recipe.name}`,
            images: recipe.image ? [recipe.image] : [],
        },
        // ✅ Métadonnées supplémentaires pour le SEO
        keywords: [
            recipe.name,
            'recette',
            'cuisine',
            recipe.difficulty,
            ...recipe.ingredients.map(ing => ing.name),
        ].join(', '),
        authors: [{ name: recipe.creator }],
        category: 'Recipe',
    };
}


// Composant principal de la page
export default async function RecipeViewPage({
                                                 params
                                             }: Readonly<PageProps>) {

    const { id } = await params;

    // Récupération des données côté serveur (SSG)
    const recipe = await getRecipe(id);

    if (!recipe) {
        notFound();
    }

    // Calcul du temps total
    const totalTime = recipe.prep_time + recipe.cook_time;

    return (
        <div className="">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

                {/* En-tête avec image et infos principales */}
                <RecipeHeader
                    recipe={recipe}
                    totalTime={totalTime}
                />

                {/* Actions rapides (modifier, partager, etc.) */}
                <RecipeActions
                    recipeId={recipe.id}
                    recipeName={recipe.name}
                />

                {/* Contenu principal en grid responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                    {/* Colonne de gauche : Ingrédients et nutrition */}
                    <div className="lg:col-span-1 space-y-6">
                        <RecipeIngredients
                            ingredients={recipe.ingredients}
                            servings={recipe.servings}
                        />

                        <RecipeNutrition
                            ingredients={recipe.ingredients}
                            servings={recipe.servings}
                            totalCalories={recipe.calories}
                        />
                    </div>

                    {/* Colonne de droite : Étapes de préparation */}
                    <div className="lg:col-span-2">
                        <RecipeSteps
                            steps={recipe.steps}
                            prepTime={recipe.prep_time}
                            cookTime={recipe.cook_time}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}