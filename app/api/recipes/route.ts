// app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RecipeData } from '@/types/recipe';
import { SearchFilters } from '@/types/search';
import { getAllRecipes } from '@/lib/services/server/recipeServices';
import { createRecipe } from '@/lib/services/client/recipeServices';

// GET - Récupérer toutes les recettes avec filtres
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Construction des filtres depuis les paramètres de requête
        const filters: SearchFilters = {
            search: searchParams.get('search') || undefined,
            tags: searchParams.get('tags')?.split(',').filter(tag => tag.trim()) || undefined,
            difficulty: searchParams.get('difficulty') || undefined,
            maxPrepTime: searchParams.get('maxPrepTime') ? parseInt(searchParams.get('maxPrepTime')!) : undefined,
            maxCookTime: searchParams.get('maxCookTime') ? parseInt(searchParams.get('maxCookTime')!) : undefined,
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
        };

        // Récupération via le service Supabase
        const result = await getAllRecipes(filters);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Erreur lors de la récupération des recettes:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la récupération des recettes',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// POST - Créer une nouvelle recette
export async function POST(request: NextRequest) {
    try {
        const recipeData = await request.json();

        // Validation des données requises
        const validation = validateRecipeData(recipeData);
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
        const enrichedData: Omit<RecipeData, 'id'> = {
            ...recipeData,
            calories: calculateTotalCalories(recipeData.ingredients),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            steps: recipeData.steps.filter((step: string) => step.trim() !== ''), // Enlever les étapes vides
            tags: recipeData.tags || []
        };

        // Création via le service Supabase
        const newRecipe = await createRecipe(enrichedData);

        return NextResponse.json(newRecipe, { status: 201 });

    } catch (error) {
        console.error('Erreur lors de la création de la recette:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la création de la recette',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// Fonction de validation des données de recette
function validateRecipeData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Le nom de la recette est requis');
    }

    if (!data.creator || typeof data.creator !== 'string' || data.creator.trim().length === 0) {
        errors.push('Le créateur est requis');
    }

    if (!data.difficulty || !['facile', 'moyen', 'difficile'].includes(data.difficulty)) {
        errors.push('La difficulté doit être: facile, moyen ou difficile');
    }

    if (typeof data.prep_time !== 'number' || data.prep_time < 0) {
        errors.push('Le temps de préparation doit être un nombre positif');
    }

    if (typeof data.cook_time !== 'number' || data.cook_time < 0) {
        errors.push('Le temps de cuisson doit être un nombre positif');
    }

    if (data.prep_time === 0 && data.cook_time === 0) {
        errors.push('Au moins un temps (préparation ou cuisson) doit être supérieur à 0');
    }

    if (typeof data.servings !== 'number' || data.servings <= 0) {
        errors.push('Le nombre de portions doit être supérieur à 0');
    }

    if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
        errors.push('Au moins un ingrédient est requis');
    }

    if (!Array.isArray(data.steps) || data.steps.filter((step: string) => step.trim()).length === 0) {
        errors.push('Au moins une étape de préparation est requise');
    }

    // Validation des ingrédients
    if (Array.isArray(data.ingredients)) {
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
        return total + (calories * quantity / 100); // Calories pour 100g normalement
    }, 0));
}