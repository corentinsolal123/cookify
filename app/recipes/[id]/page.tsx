// app/recipes/[id]/page.tsx
import { notFound } from "next/navigation";
import RecipeDetail from "@/components/recipes/RecipeDetail";

type Props = {
    params: { id: string };
};

export default async function RecipeDetailPage({ params }: Props) {
    const { id } = params;

    // Récupération de la recette
    const res = await fetch(`http://localhost:3000/api/recipes/${id}`, { cache: "no-store" });
    if (!res.ok) {
        // Gère le 404 ou autre
        notFound();
    }

    const recipe = await res.json();

    return (
        <main className="p-6 h-full">
            <h1 className="text-2xl font-bold mb-4">
                Détail de la recette
            </h1>
            <RecipeDetail recipe={recipe} />
        </main>
    );
}
