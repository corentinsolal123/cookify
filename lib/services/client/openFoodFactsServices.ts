// lib/services/client/openFoodFactsService.ts

export interface OpenFoodFactsIngredient {
    code: string;
    product_name: string;
    product_name_fr?: string;
    nutriments: {
        'energy-kcal_100g'?: number;
        'proteins_100g'?: number;
        'carbohydrates_100g'?: number;
        'fat_100g'?: number;
        'fiber_100g'?: number;
        'sugars_100g'?: number;
        'salt_100g'?: number;
    };
    categories?: string;
    brands?: string;
    image_url?: string;
}

export interface IngredientSuggestion {
    id: string;
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugars?: number;
    salt?: number;
    commonUnits: string[];
    category?: string;
    brand?: string;
    imageUrl?: string;
    source: 'openfoodfacts' | 'manual';
}

// Unités communes par type d'ingrédient
const getCommonUnits = (categories: string = ''): string[] => {
    const lowerCategories = categories.toLowerCase();

    if (lowerCategories.includes('liquide') || lowerCategories.includes('boisson')) {
        return ['ml', 'cl', 'l', 'cuillère à café', 'cuillère à soupe', 'tasse'];
    }

    if (lowerCategories.includes('épice') || lowerCategories.includes('aromate')) {
        return ['g', 'cuillère à café', 'cuillère à soupe', 'pincée'];
    }

    if (lowerCategories.includes('fruit') || lowerCategories.includes('légume')) {
        return ['g', 'kg', 'pièce', 'tranche'];
    }

    // Unités par défaut
    return ['g', 'kg', 'ml', 'cl', 'l', 'cuillère à café', 'cuillère à soupe', 'tasse', 'pièce'];
};

/**
 * Rechercher des ingrédients via l'API OpenFoodFacts
 */
export async function searchIngredients(query: string): Promise<IngredientSuggestion[]> {
    if (query.length < 2) {
        return [];
    }

    try {
        // API OpenFoodFacts avec paramètres spécifiques pour les ingrédients
        const url = new URL('https://fr.openfoodfacts.org/cgi/search.pl');
        url.searchParams.set('search_terms', query);
        url.searchParams.set('search_simple', '1');
        url.searchParams.set('action', 'process');
        url.searchParams.set('json', '1');
        url.searchParams.set('page_size', '20');
        url.searchParams.set('fields', 'code,product_name,product_name_fr,nutriments,categories,brands,image_url');

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Cookify-App/1.0 (contact@cookify.app)'
            }
        });

        if (!response.ok) {
            throw new Error('Erreur API OpenFoodFacts');
        }

        const data = await response.json();

        if (!data.products || !Array.isArray(data.products)) {
            return [];
        }

        // Transformer les résultats OpenFoodFacts
        const suggestions: IngredientSuggestion[] = data.products
            .filter((product: OpenFoodFactsIngredient) => {
                // Filtrer les produits avec des données nutritionnelles
                return product.nutriments &&
                    typeof product.nutriments['energy-kcal_100g'] === 'number' &&
                    (product.product_name_fr || product.product_name);
            })
            .map((product: OpenFoodFactsIngredient) => {
                const name = product.product_name_fr || product.product_name || '';
                const calories = product.nutriments['energy-kcal_100g'] || 0;
                const categories = product.categories || '';

                return {
                    id: `off-${product.code}`,
                    name: name.toLowerCase(),
                    calories: Math.round(calories),
                    proteins: product.nutriments['proteins_100g'] ? Math.round(product.nutriments['proteins_100g'] * 10) / 10 : 0,
                    carbs: product.nutriments['carbohydrates_100g'] ? Math.round(product.nutriments['carbohydrates_100g'] * 10) / 10 : 0,
                    fat: product.nutriments['fat_100g'] ? Math.round(product.nutriments['fat_100g'] * 10) / 10 : 0,
                    fiber: product.nutriments['fiber_100g'] ? Math.round(product.nutriments['fiber_100g'] * 10) / 10 : 0,
                    sugars: product.nutriments['sugars_100g'] ? Math.round(product.nutriments['sugars_100g'] * 10) / 10 : undefined,
                    salt: product.nutriments['salt_100g'] ? Math.round(product.nutriments['salt_100g'] * 1000) / 1000 : undefined, // en g
                    commonUnits: getCommonUnits(categories),
                    category: categories.split(',')[0]?.trim() || undefined,
                    brand: product.brands?.split(',')[0]?.trim() || undefined,
                    imageUrl: product.image_url,
                    source: 'openfoodfacts'
                };
            })
            .slice(0, 10); // Limiter à 10 résultats

        return suggestions;

    } catch (error) {
        console.error('Erreur lors de la recherche OpenFoodFacts:', error);
        return [];
    }
}

/**
 * Rechercher des ingrédients en local (base Cookify) + OpenFoodFacts
 */
export async function searchIngredientsHybrid(query: string): Promise<IngredientSuggestion[]> {
    try {
        // 1. Recherche locale (ingrédients déjà utilisés dans l'app)
        const localResults = await searchLocalIngredients(query);

        // 2. Recherche OpenFoodFacts (si pas assez de résultats locaux)
        let openFoodFactsResults: IngredientSuggestion[] = [];
        if (localResults.length < 5) {
            openFoodFactsResults = await searchIngredients(query);
        }

        // 3. Combiner et dédupliquer
        const allResults = [...localResults, ...openFoodFactsResults];
        const uniqueResults = allResults.filter((item, index, array) =>
            array.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase()) === index
        );

        return uniqueResults.slice(0, 10);

    } catch (error) {
        console.error('Erreur recherche hybride:', error);
        return [];
    }
}

/**
 * Rechercher dans les ingrédients déjà utilisés dans l'app (optionnel)
 */
async function searchLocalIngredients(query: string): Promise<IngredientSuggestion[]> {
    // Ici tu pourrais faire une requête à ta base Supabase pour récupérer
    // les ingrédients les plus utilisés dans ton app
    // Pour l'instant on retourne un tableau vide
    return [];
}

/**
 * Créer un ingrédient manuellement (fallback)
 */
export function createManualIngredient(name: string): IngredientSuggestion {
    return {
        id: `manual-${Date.now()}`,
        name: name.toLowerCase().trim(),
        calories: 0, // L'utilisateur devra saisir manuellement
        proteins: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        commonUnits: ['g', 'kg', 'ml', 'cl', 'l', 'cuillère à café', 'cuillère à soupe', 'tasse', 'pièce'],
        source: 'manual'
    };
}