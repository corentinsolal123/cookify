// app/recipes/[id]/page.tsx
import RecipeDetailWrapper from "@/components/recipes/RecipeDetailWrapper";
import { getRecipeById } from "@/lib/services/client/recipeServices";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({ params }: Readonly<Props>) {
    const { id } = await params;

    // Récupération de la recette
    const recipe = await getRecipeById(id);

    if (!recipe) {
        return (
            <div>Recette introuvable</div>
        );
    }
    return (
        <main className="p-6 h-full">
            <h1 className="text-2xl font-bold mb-4">
                Détail de la recette
            </h1>
            <RecipeDetailWrapper recipe={recipe} />
        </main>
    );

}