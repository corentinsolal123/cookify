// app/recipes/[id]/edit/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeData } from '@/types/recipe';
import RecipeEditForm from '@/components/recipes/form/RecipeEditForm';

import { getRecipeByIdServer } from '@/lib/services/server/recipeServices';

// Fonction pour récupérer une recette existante (pour modification)
async function getRecipe(id: string): Promise<RecipeData | null> {
    // Si l'ID est "new", on crée une nouvelle recette
    if (id === 'new') {
        return null;
    }

    try {
        // Utilisation du service Supabase serveur pour SSR
        return await getRecipeByIdServer(id);
    } catch (error) {
        console.error('Erreur lors de la récupération de la recette:', error);
        return null;
    }
}

// Métadonnées dynamiques selon le contexte (création vs modification)
export async function generateMetadata({
                                           params
                                       }: {
    params: { id: string }
}): Promise<Metadata> {
    if (params.id === 'new') {
        return {
            title: 'Nouvelle recette - Cookify',
            description: 'Créer une nouvelle recette sur Cookify',
        };
    }

    const recipe = await getRecipe(params.id);

    return {
        title: recipe
            ? `Modifier ${recipe.name} - Cookify`
            : 'Recette non trouvée - Cookify',
        description: recipe
            ? `Modifier la recette ${recipe.name}`
            : 'La recette demandée n\'existe pas',
    };
}

// Composant principal de la page d'édition
export default async function RecipeEditPage({
                                                 params
                                             }: {
    params: { id: string }
}) {
    // Récupération de la recette existante (si modification)
    const existingRecipe = await getRecipe(params.id);

    // Si on essaie de modifier une recette qui n'existe pas
    if (params.id !== 'new' && !existingRecipe) {
        notFound();
    }

    // Déterminer le mode (création ou modification)
    const isCreating = params.id === 'new';
    const pageTitle = isCreating ? 'Créer une nouvelle recette' : `Modifier ${existingRecipe?.name}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* En-tête de la page */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {pageTitle}
                    </h1>

                    <p className="text-gray-600">
                        {isCreating
                            ? 'Remplis les informations ci-dessous pour créer ta nouvelle recette.'
                            : 'Modifie les informations de ta recette et sauvegarde tes changements.'
                        }
                    </p>
                </div>

                {/* Formulaire d'édition */}
                <RecipeEditForm
                    initialData={existingRecipe}
                    isCreating={isCreating}
                    recipeId={params.id}
                />
            </div>
        </div>
    );
}