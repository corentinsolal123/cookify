// app/api/nutrition/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface IngredientInput {
    name: string;
    quantity: number;
    unit: string;
}

interface EdamamResponse {
    totalNutrients: {
        ENERC_KCAL: { quantity: number };
        PROCNT: { quantity: number };
        CHOCDF: { quantity: number };
        FAT: { quantity: number };
        FIBTG: { quantity: number };
        SUGAR: { quantity: number };
        NA: { quantity: number };
    };
}

// Fonction pour normaliser les unités pour l'API Edamam
function normalizeIngredientForAPI(ingredient: IngredientInput): string {
    const { quantity, unit, name } = ingredient;

    // Conversion des unités françaises vers anglais pour Edamam
    const unitMap: { [key: string]: string } = {
        'g': 'gram',
        'kg': 'kilogram',
        'ml': 'milliliter',
        'l': 'liter',
        'cl': 'centiliter',
        'cuillère à soupe': 'tablespoon',
        'cuillère à café': 'teaspoon',
        'tasse': 'cup',
        'pièce': 'piece',
        'tranche': 'slice'
    };

    const normalizedUnit = unitMap[unit.toLowerCase()] || unit;

    // Format requis par Edamam: "quantity unit ingredient"
    return `${quantity} ${normalizedUnit} ${name}`;
}

export async function POST(request: NextRequest) {
    try {
        const { ingredients, servings } = await request.json();

        if (!ingredients || !Array.isArray(ingredients)) {
            return NextResponse.json(
                { error: 'Liste d\'ingrédients requise' },
                { status: 400 }
            );
        }

        // Configuration Edamam (tu peux aussi utiliser USDA FoodData Central)
        const edamamAppId = process.env.EDAMAM_APP_ID;
        const edamamAppKey = process.env.EDAMAM_APP_KEY;

        if (!edamamAppId || !edamamAppKey) {
            return NextResponse.json(
                { error: 'Configuration API manquante' },
                { status: 500 }
            );
        }

        // Préparation des ingrédients pour l'API Edamam
        const ingredientLines = ingredients.map((ing: IngredientInput) =>
            normalizeIngredientForAPI(ing)
        );

        // Appel à l'API Edamam Nutrition Analysis
        const edamamResponse = await fetch('https://api.edamam.com/api/nutrition-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Recipe Analysis',
                ingr: ingredientLines
            }),
        });

        // Ajout des paramètres d'authentification dans l'URL
        const url = new URL('https://api.edamam.com/api/nutrition-details');
        url.searchParams.append('app_id', edamamAppId);
        url.searchParams.append('app_key', edamamAppKey);

        const finalResponse = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: 'Recipe Analysis',
                ingr: ingredientLines
            }),
        });

        if (!finalResponse.ok) {
            // Si Edamam échoue, utilise les données basiques des ingrédients
            console.warn('Edamam API failed, using fallback calculation');

            const fallbackData = {
                calories: ingredients.reduce((total: number, ing: any) =>
                    total + (ing.calories || 0), 0),
                protein: ingredients.length * 5, // Estimation basique
                carbs: ingredients.length * 15,
                fat: ingredients.length * 3,
                fiber: ingredients.length * 2,
                sugar: ingredients.length * 5,
                sodium: ingredients.length * 100
            };

            return NextResponse.json(fallbackData);
        }

        const edamamData: EdamamResponse = await finalResponse.json();

        // Extraction des données nutritionnelles
        const nutritionData = {
            calories: Math.round(edamamData.totalNutrients.ENERC_KCAL?.quantity || 0),
            protein: Math.round(edamamData.totalNutrients.PROCNT?.quantity || 0),
            carbs: Math.round(edamamData.totalNutrients.CHOCDF?.quantity || 0),
            fat: Math.round(edamamData.totalNutrients.FAT?.quantity || 0),
            fiber: Math.round(edamamData.totalNutrients.FIBTG?.quantity || 0),
            sugar: Math.round(edamamData.totalNutrients.SUGAR?.quantity || 0),
            sodium: Math.round(edamamData.totalNutrients.NA?.quantity || 0)
        };

        // Cache des résultats (optionnel - Redis, MongoDB, etc.)
        // await cacheNutritionData(ingredientLines, nutritionData);

        return NextResponse.json(nutritionData);

    } catch (error) {
        console.error('Erreur lors de l\'analyse nutritionnelle:', error);

        // En cas d'erreur, retourne des données par défaut
        return NextResponse.json(
            {
                error: 'Erreur lors de l\'analyse nutritionnelle',
                // Données de fallback basiques
                calories: 200,
                protein: 10,
                carbs: 30,
                fat: 8,
                fiber: 5,
                sugar: 10,
                sodium: 300
            },
            { status: 500 }
        );
    }
}

// Endpoint GET pour vérifier le statut de l'API
export async function GET() {
    return NextResponse.json({
        status: 'API Nutrition disponible',
        providers: ['Edamam', 'Fallback calculation'],
        timestamp: new Date().toISOString()
    });
}