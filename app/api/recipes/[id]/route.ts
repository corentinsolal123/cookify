// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRecipeByIdServer } from '@/lib/services/server/recipeServices';
import { updateRecipe, deleteRecipe } from '@/lib/services/client/recipeServices';

// GET - Récupérer une recette par ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID de recette requis' },
                { status: 400 }
            );
        }

        // Récupération via le service Supabase serveur
        const recipe = await getRecipeByIdServer(id);

        if (!recipe) {
            return NextResponse.json(
                { error: 'Recette non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json(recipe);

    } catch (error) {
        console.error('Erreur lors de la récupération de la recette:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la récupération de la recette',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// PUT - Mettre à jour une recette
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const updates = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'ID de recette requis' },
                { status: 400 }
            );
        }

        // Validation des données si elles sont présentes
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'Aucune donnée à mettre à jour' },
                { status: 400 }
            );
        }

        // Validation partielle des données mises à jour
        const validation = validatePartialRecipeData(updates);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'Données invalides',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // Enrichissement des données
        const enrichedUpdates = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Recalculer les calories si les ingrédients ont changé
        if (updates.ingredients) {
            enrichedUpdates.calories = calculateTotalCalories(updates.ingredients);
            enrichedUpdates.steps = updates.steps?.filter((step: string) => step.trim() !== '') || updates.steps;
        }

        // Mise à jour via le service Supabase
        const updatedRecipe = await updateRecipe(id, enrichedUpdates);

        return NextResponse.json(updatedRecipe);

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la recette:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la mise à jour de la recette',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer une recette
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID de recette requis' },
                { status: 400 }
            );
        }

        // Vérifier que la recette existe avant de la supprimer
        const existingRecipe = await getRecipeByIdServer(id);
        if (!existingRecipe) {
            return NextResponse.json(
                { error: 'Recette non trouvée' },
                { status: 404 }
            );
        }

        // Suppression via le service Supabase
        await deleteRecipe(id);

        return NextResponse.json({
            success: true,
            message: 'Recette supprimée avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de la recette:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la suppression de la recette',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// Fonction de validation partielle (pour les mises à jour)
function validatePartialRecipeData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || data.name.trim().length === 0) {
            errors.push('Le nom de la recette ne peut pas être vide');
        }
    }

    if (data.creator !== undefined) {
        if (typeof data.creator !== 'string' || data.creator.trim().length === 0) {
            errors.push('Le créateur ne peut pas être vide');
        }
    }

    if (data.difficulty !== undefined) {
        if (!['facile', 'moyen', 'difficile'].includes(data.difficulty)) {
            errors.push('La difficulté doit être: facile, moyen ou difficile');
        }
    }

    if (data.prep_time !== undefined) {
        if (typeof data.prep_time !== 'number' || data.prep_time < 0) {
            errors.push('Le temps de préparation doit être un nombre positif');
        }
    }

    if (data.cook_time !== undefined) {
        if (typeof data.cook_time !== 'number' || data.cook_time < 0) {
            errors.push('Le temps de cuisson doit être un nombre positif');
        }
    }

    if (data.servings !== undefined) {
        if (typeof data.servings !== 'number' || data.servings <= 0) {
            errors.push('Le nombre de portions doit être supérieur à 0');
        }
    }

    if (data.ingredients !== undefined) {
        if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
            errors.push('Au moins un ingrédient est requis');
        } else {
            // Validation des ingrédients
            data.ingredients.forEach((ingredient: any, index: number) => {
                if (!ingredient.name || typeof ingredient.name !== 'string') {
                    errors.push(`Ingrédient ${index + 1}: nom requis`);
                }
                if (typeof ingredient.quantityPerServing !== 'number' || ingredient.quantityPerServing <= 0) {
                    errors.push(`Ingrédient ${index + 1}: quantité requise et positive`);
                }
                if (!ingredient.unit || typeof ingredient.unit !== 'string') {
                    errors.push(`Ingrédient ${index + 1}: unité requise`);
                }
            });
        }
    }

    if (data.steps !== undefined) {
        if (!Array.isArray(data.steps) || data.steps.filter((step: string) => step.trim()).length === 0) {
            errors.push('Au moins une étape de préparation est requise');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Fonction pour calculer les calories totales
function calculateTotalCalories(ingredients: any[]): number {
    return Math.round(ingredients.reduce((total, ingredient) => {
        const calories = ingredient.calories || 0;
        const quantity = ingredient.quantityPerServing || 0;
        return total + (calories * quantity / 100);
    }, 0));
}