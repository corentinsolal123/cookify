// app/recipes/new/page.tsx
import { Metadata } from 'next';
import RecipeEditForm from '@/components/recipes/form/RecipeEditForm';

// Métadonnées de la page
export const metadata: Metadata = {
    title: 'Nouvelle recette - Cookify',
    description: 'Créer une nouvelle recette sur Cookify',
};

// Composant de la page de création
export default function NewRecipePage() {
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* En-tête de la page */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Créer une nouvelle recette
                    </h1>

                    <p className="">
                        Partage ta recette favorite avec la communauté Cookify !
                        Remplis les informations ci-dessous pour créer ta nouvelle recette.
                    </p>
                </div>

                {/* Formulaire d'édition en mode création */}
                <RecipeEditForm
                    initialData={null}
                    isCreating={true}
                    recipeId="new"
                />
            </div>
        </div>
    );
}