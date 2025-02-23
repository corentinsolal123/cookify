// app/recipes/page.tsx

import RecipeList from "@/components/recipes/RecipeList";

export default async function RecipesPage() {
    // On récupère la liste des recettes côté serveur
    const res = await fetch("http://localhost:3000/api/recipes", { cache: "no-store" });
    const recipes = await res.json();

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Liste des recettes</h1>
            {/* On injecte les recettes dans ton composant client */}
            <RecipeList recipes={recipes} />
        </main>
    );
}
