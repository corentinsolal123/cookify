"use client";

import { useEffect, useState } from "react";

import RecipeForm from "@/components/recipes/RecipeForm";
import RecipeList from "@/components/recipes/RecipeList";
import { IRecipe } from "@/types/recipe";
import { createRecipeAPI, fetchRecipesAPI } from "@/lib/api";

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<IRecipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadRecipes = async () => {
        try {
            const data = await fetchRecipesAPI();

            setRecipes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecipes();
    }, []);

    const handleCreateRecipe = async (data: {
        titre: string;
        description: string;
        etapes: string[];
    }) => {
        try {
            // On crée une nouvelle recette en utilisant l'API
            await createRecipeAPI({
                titre: data.titre,
                description: data.description,
                etapes: data.etapes,
                ingredients: [],
                tags: []
            });
            loadRecipes();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Cookify - Test des Recettes</h1>

            <section className="form-section">
                <RecipeForm onSubmit={handleCreateRecipe} />
            </section>

            <section className="list-section">
                <h2 className="section-title">Liste des recettes</h2>
                {loading ? (
                    <p>Chargement...</p>
                ) : error ? (
                    <p className="error">Erreur : {error}</p>
                ) : (
                    <RecipeList recipes={recipes} />
                )}
            </section>

        </div>
    );
}
