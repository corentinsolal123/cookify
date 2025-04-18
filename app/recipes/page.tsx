"use client";
// app/recipes/page.tsx

import RecipeList from "@/components/recipes/RecipeList";
import { Button, Divider, Link } from "@heroui/react";

export default async function RecipesPage() {
    // On récupère la liste des recettes côté serveur
    const res = await fetch("http://localhost:3000/api/recipes", { cache: "no-store" });
    const recipes = await res.json();

    console.log(recipes);

    return (
        <main className="p-6 h-full w-full">
            <div className="w-full max-w-7xl flex flex-row justify-between mb-6">
                <h1 className="text-2xl font-bold mb-4">Liste des recettes</h1>
                <Button
                    as={Link}
                    color="primary"
                    href="/recipes/edit/new"
                    variant="solid"
                >
                    Créer une recette
                </Button>
            </div>
            <Divider className="mb-6"/>
            <RecipeList
                recipes={recipes}
            />
        </main>
    );
}
