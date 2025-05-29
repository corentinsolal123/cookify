"use client";
// app/recipes/[id]//edit/page.tsx

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RecipeFormWrapper from "@/components/recipes/RecipeFormWrapper";
import { RecipeData } from "@/types/recipe";
import { createRecipe, getRecipeById, updateRecipe } from "@/lib/services/client/recipeServices";

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const isNew = id === "new";  // si "new", on est en création
    const [recipe, setRecipe] = useState<RecipeData>(); // contiendra la recette existante si édition
    const [loading, setLoading] = useState(true);

    // Si on est en édition, on récupère la recette
    useEffect(() => {
        if (!isNew) {
            getRecipeById(id)
                .then((data) => {
                    setRecipe(data!);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    // Optionnel: gérer l'erreur (rediriger, afficher un message, etc.)
                });
        } else {
            // En création, pas besoin de fetch
            setLoading(false);
        }
    }, [id, isNew]);

    // Gestion de la soumission du formulaire
    async function handleSubmit(data: any) {
        try {
            let result;

            if (isNew) {
                result = await createRecipe(data);
            } else {
                result = await updateRecipe(id, data);
            }

            // Redirection après succès
            router.push("/recipes");
        } catch (err) {
            console.error("Erreur lors de la sauvegarde de la recette:", err);
        }
    }

    if (loading) {
        return <p>Chargement...</p>;
    }

    // Données initiales pour le formulaire
    const defaultData = {
        name: "",
        description: "",
        difficulty: "",
        prepTime: 0,
        cookTime: 0,
        calories: 0,
        creator: "",
        steps: [""],
        servings: 1,
        ingredients: []
        // ...etc
    };

    // Si on est en édition, on fusionne la recette existante avec le default
    const initialData = recipe ? { ...defaultData, ...recipe } : defaultData;

    return (
        <main className="p-6 h-full">
            <h1 className="text-2xl font-bold mb-4">
                {isNew ? "Créer une recette" : `Modifier la recette #${id}`}
            </h1>
            <RecipeFormWrapper
                onSubmit={handleSubmit}
                existingIngredients={existingIngredients}
                initialData={initialData}
                isNew={isNew}
            />
        </main>
    );
}
