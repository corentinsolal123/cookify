// app/api/ingredients/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Interface pour la réponse de l'API USDA FoodData Central
interface USDAFoodItem {
    fdcId: number;
    description: string;
    foodNutrients: Array<{
        nutrientId: number;
        value: number;
    }>;
}

// Base de données locale d'ingrédients français couramment utilisés
const LOCAL_INGREDIENTS = [
    { name: 'Farine de blé', calories: 364, commonUnits: ['g', 'tasse'] },
    { name: 'Sucre blanc', calories: 387, commonUnits: ['g', 'cuillère à soupe'] },
    { name: 'Beurre', calories: 717, commonUnits: ['g', 'cuillère à soupe'] },
    { name: 'Œufs', calories: 155, commonUnits: ['pièce', 'g'] },
    { name: 'Lait entier', calories: 61, commonUnits: ['ml', 'tasse'] },
    { name: 'Huile d\'olive', calories: 884, commonUnits: ['ml', 'cuillère à soupe'] },
    { name: 'Tomates', calories: 18, commonUnits: ['g', 'pièce'] },
    { name: 'Oignons', calories: 40, commonUnits: ['g', 'pièce'] },
    { name: 'Ail', calories: 149, commonUnits: ['g', 'gousse'] },
    { name: 'Pommes de terre', calories: 77, commonUnits: ['g', 'pièce'] },
    { name: 'Carottes', calories: 41, commonUnits: ['g', 'pièce'] },
    { name: 'Courgettes', calories: 17, commonUnits: ['g', 'pièce'] },
    { name: 'Poivrons', calories: 31, commonUnits: ['g', 'pièce'] },
    { name: 'Basilic frais', calories: 22, commonUnits: ['g', 'feuille'] },
    { name: 'Persil', calories: 36, commonUnits: ['g', 'cuillère à soupe'] },
    { name: 'Sel', calories: 0, commonUnits: ['g', 'cuillère à café'] },
    { name: 'Poivre noir', calories: 251, commonUnits: ['g', 'cuillère à café'] },
    { name: 'Parmesan râpé', calories: 431, commonUnits: ['g', 'cuillère à soupe'] },
    { name: 'Mozzarella', calories: 280, commonUnits: ['g', 'tranche'] },
    { name: 'Pâtes', calories: 131, commonUnits: ['g', 'portion'] },
    { name: 'Riz', calories: 130, commonUnits: ['g', 'tasse'] },
    { name: 'Pain', calories: 265, commonUnits: ['g', 'tranche'] },
    { name: 'Pommes', calories: 52, commonUnits: ['g', 'pièce'] },
    { name: 'Bananes', calories: 89, commonUnits: ['g', 'pièce'] },
    { name: 'Citrons', calories: 29, commonUnits: ['g', 'pièce'] },
    { name: 'Oranges', calories: 47, commonUnits: ['g', 'pièce'] },
    { name: 'Poulet', calories: 239, commonUnits: ['g', 'portion'] },
    { name: 'Bœuf haché', calories: 254, commonUnits: ['g', 'portion'] },
    { name: 'Saumon', calories: 208, commonUnits: ['g', 'filet'] },
    { name: 'Thon', calories: 144, commonUnits: ['g', 'boîte'] }
];

// Fonction pour rechercher dans la base locale
function searchLocalIngredients(query: string, limit: number = 10) {
    const normalizedQuery = query.toLowerCase().trim();

    return LOCAL_INGREDIENTS
        .filter(ingredient =>
            ingredient.name.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, limit)
        .map(ingredient => ({
            name: ingredient.name,
            calories: ingredient.calories,
            commonUnits: ingredient.commonUnits,
            source: 'local'
        }));
}

// Fonction pour rechercher via l'API USDA (optionnel)
async function searchUSDAIngredients(query: string, limit: number = 5) {
    const apiKey = process.env.USDA_API_KEY;

    if (!apiKey) {
        return [];
    }

    try {
        const response = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=${limit}`
        );

        if (!response.ok) {
            throw new Error('USDA API request failed');
        }

        const data = await response.json();

        return data.foods?.map((food: USDAFoodItem) => {
            // Extraction des calories (nutrientId 1008 = Energy en kcal)
            const calorieNutrient = food.foodNutrients.find(n => n.nutrientId === 1008);
            const calories = calorieNutrient ? Math.round(calorieNutrient.value) : 0;

            return {
                name: food.description,
                calories,
                commonUnits: ['g', 'portion'], // Unités par défaut pour USDA
                source: 'usda'
            };
        }) || [];

    } catch (error) {
        console.error('Erreur USDA API:', error);
        return [];
    }
}

// Fonction pour nettoyer et déduplicater les résultats
function cleanAndDeduplicateResults(results: any[]) {
    const seen = new Set();
    const cleaned = [];

    for (const result of results) {
        const key = result.name.toLowerCase().trim();
        if (!seen.has(key) && result.name.length > 0) {
            seen.add(key);
            cleaned.push({
                ...result,
                name: result.name.charAt(0).toUpperCase() + result.name.slice(1).toLowerCase()
            });
        }
    }

    return cleaned;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 10;

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                suggestions: [],
                message: 'Requête trop courte (minimum 2 caractères)'
            });
        }

        // Recherche dans la base locale (priorité)
        const localResults = searchLocalIngredients(query, Math.ceil(limit * 0.7));

        // Recherche complémentaire via USDA si disponible
        const usdaResults = await searchUSDAIngredients(query, Math.ceil(limit * 0.3));

        // Combinaison et nettoyage des résultats
        const allResults = [...localResults, ...usdaResults];
        const cleanedResults = cleanAndDeduplicateResults(allResults);

        return NextResponse.json({
            suggestions: cleanedResults.slice(0, limit),
            total: cleanedResults.length,
            sources: {
                local: localResults.length,
                usda: usdaResults.length
            }
        });

    } catch (error) {
        console.error('Erreur lors de la recherche d\'ingrédients:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la recherche',
                suggestions: []
            },
            { status: 500 }
        );
    }
}

// Endpoint pour obtenir les détails d'un ingrédient spécifique
export async function POST(request: NextRequest) {
    try {
        const { ingredients } = await request.json();

        if (!Array.isArray(ingredients)) {
            return NextResponse.json(
                { error: 'Format invalide - array d\'ingrédients requis' },
                { status: 400 }
            );
        }

        // Enrichissement des ingrédients avec des données nutritionnelles
        const enrichedIngredients = ingredients.map(ingredient => {
            // Recherche dans la base locale
            const localMatch = LOCAL_INGREDIENTS.find(local =>
                local.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                ingredient.name.toLowerCase().includes(local.name.toLowerCase())
            );

            if (localMatch) {
                return {
                    ...ingredient,
                    calories: localMatch.calories,
                    commonUnits: localMatch.commonUnits,
                    source: 'local'
                };
            }

            // Valeurs par défaut si pas de correspondance
            return {
                ...ingredient,
                calories: ingredient.calories || 50, // Estimation par défaut
                commonUnits: ['g', 'portion'],
                source: 'estimation'
            };
        });

        return NextResponse.json({
            ingredients: enrichedIngredients,
            processed: enrichedIngredients.length
        });

    } catch (error) {
        console.error('Erreur lors de l\'enrichissement des ingrédients:', error);

        return NextResponse.json(
            { error: 'Erreur lors du traitement des ingrédients' },
            { status: 500 }
        );
    }
}
