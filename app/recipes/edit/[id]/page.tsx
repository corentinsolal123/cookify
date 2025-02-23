// app/recipes/manage/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RecipeForm from "@/components/recipes/RecipeForm";

export default function ManageRecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const isNew = id === "new";  // si "new", on est en création
    const [recipe, setRecipe] = useState<any>(null); // contiendra la recette existante si édition
    const [loading, setLoading] = useState(true);

    // Si on est en édition, on récupère la recette
    useEffect(() => {
        if (!isNew) {
            fetch(`/api/recipes/${id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Not found");
                    return res.json();
                })
                .then((data) => {
                    setRecipe(data);
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

    // On peut éventuellement récupérer la liste d’ingrédients existants
    const [existingIngredients, setExistingIngredients] = useState<any[]>([]);

    useEffect(() => {
        // exemple : fetch vers /api/ingredients
        fetch("/api/ingredients")
            .then((res) => res.json())
            .then((data) => setExistingIngredients(data))
            .catch((err) => console.error(err));
    }, []);

    // Gestion de la soumission du formulaire
    async function handleSubmit(data: any) {
        try {
            const method = isNew ? "POST" : "PUT";
            const url = isNew ? "/api/recipes" : `/api/recipes/${id}`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                // Redirection après succès
                router.push("/recipes");
            } else {
                console.error("Erreur lors de la sauvegarde de la recette");
            }
        } catch (err) {
            console.error(err);
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
        ingredients: []
        // ...etc
    };

    // Si on est en édition, on fusionne la recette existante avec le default
    const initialData = recipe ? { ...defaultData, ...recipe } : defaultData;

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                {isNew ? "Créer une recette" : `Modifier la recette #${id}`}
            </h1>
            <RecipeForm
                onSubmit={handleSubmit}
                existingIngredients={existingIngredients}
                initialData={initialData}
                isNew={isNew}
            />
        </main>
    );
}
