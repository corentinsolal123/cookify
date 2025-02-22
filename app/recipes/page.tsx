"use client";

import { useEffect, useState } from "react";

import RecipeForm from "@/components/recipes/RecipeForm";
import RecipeList from "@/components/recipes/RecipeList";
import { IIngredient, IRecipe } from "@/types/recipe";
import { createRecipeAPI, fetchIngredientsAPI, fetchRecipesAPI } from "@/lib/api";

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<IRecipe[]>([]);
    const [ingredients, setIngredients] = useState<IIngredient[]>([]);
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
    const loadIngedients = async () => {
        try {
            const data = await fetchIngredientsAPI();

            setIngredients(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecipes();
        loadIngedients();
    }, []);

    const handleCreateRecipe = async (data: IRecipe) => {
        try {
            // On crée une nouvelle recette en utilisant l'API
            await createRecipeAPI({
                name: data.name,
                steps: data.steps,
                ingredients: data.ingredients,
                tags: [],
                cookTime: data.cookTime,
                creator: undefined,
                difficulty: data.difficulty,
                image: data.image,
                prepTime: data.prepTime
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
                <RecipeForm onSubmit={handleCreateRecipe} existingIngredients={ingredients} />
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
