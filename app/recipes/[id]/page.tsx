// app/recipes/[id]/page.tsx
import { notFound } from "next/navigation";
import RecipeDetailWrapper from "@/components/recipes/RecipeDetailWrapper";
import { getRecipeById } from "@/services/recipeServices";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({ params }: Props) {
    const { id } = await params;

    try {
        // Récupération de la recette
        const recipe = await getRecipeById(id);

        return (
            <main className="p-6 h-full">
                <h1 className="text-2xl font-bold mb-4">
                    Détail de la recette
                </h1>
                <RecipeDetailWrapper recipe={recipe} />
            </main>
        );
    } catch (error) {
        // Gère le 404 ou autre
        notFound();
    }
}