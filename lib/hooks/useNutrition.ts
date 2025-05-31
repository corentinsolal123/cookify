// lib/hooks/useNutrition.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Interface pour les données de ton proxy
interface ProxyApiResponse {
    query: string;
    count: number;
    products: {
        fdcId: string;
        description: string;
        foodNutrients: {
            nutrientId: number;
            nutrientName: string;
            value: number;
            unitName: string;
        }[];
    }[];
    source: string;
    timestamp: string;
    debug: string;
}

// Interface pour les données OpenFoodFacts (garde la même)
interface FoodItem {
    fdcId: number | string;
    description: string;
    foodNutrients: {
        nutrientId: number;
        nutrientName: string;
        value: number;
        unitName: string;
    }[];
}

// Interface adaptée à Cookify - Compatible avec tes types existants
export interface IngredientSuggestion {
    id: string;
    name: string;
    calories: number;
    proteins: number;
    carbs: number;
    fat: number;
    fiber: number;
    commonUnits: string[];
    category?: string;
    brand?: string;
    imageUrl?: string;
    source: 'local' | 'openfoodfacts' | 'manual';
}

// Fonction utilitaire pour convertir suggestion vers IngredientData
export const suggestionToIngredientData = (
    suggestion: IngredientSuggestion,
    quantity: number = 100,
    unit: string = 'g'
): IngredientData => ({
    name: suggestion.name,
    quantityPerServing: quantity,
    unit: unit,
    calories: suggestion.calories,
    proteins: suggestion.proteins,
    carbs: suggestion.carbs,
    fat: suggestion.fat,
    fiber: suggestion.fiber,
});

// Import des types existants
import type { IngredientData, NutritionalInfo } from '@/types/ingredient';

// Base d'ingrédients français communs (garde la même base)
const commonFrenchIngredients: FoodItem[] = [
    {
        fdcId: 1001,
        description: "Farine de blé",
        foodNutrients: [
            { nutrientId: 1, nutrientName: "Énergie", value: 364, unitName: "kcal" },
            { nutrientId: 2, nutrientName: "Protéines", value: 10.3, unitName: "g" },
            { nutrientId: 3, nutrientName: "Glucides", value: 76.3, unitName: "g" },
            { nutrientId: 4, nutrientName: "Lipides", value: 0.9, unitName: "g" },
            { nutrientId: 5, nutrientName: "Fibres", value: 2.7, unitName: "g" },
        ]
    },
    {
        fdcId: 1002,
        description: "Sucre blanc",
        foodNutrients: [
            { nutrientId: 1, nutrientName: "Énergie", value: 387, unitName: "kcal" },
            { nutrientId: 2, nutrientName: "Protéines", value: 0, unitName: "g" },
            { nutrientId: 3, nutrientName: "Glucides", value: 100, unitName: "g" },
            { nutrientId: 4, nutrientName: "Lipides", value: 0, unitName: "g" },
            { nutrientId: 5, nutrientName: "Fibres", value: 0, unitName: "g" },
        ]
    },
    {
        fdcId: 1015,
        description: "Pulpe de tomate",
        foodNutrients: [
            { nutrientId: 1, nutrientName: "Énergie", value: 20, unitName: "kcal" },
            { nutrientId: 2, nutrientName: "Protéines", value: 1.0, unitName: "g" },
            { nutrientId: 3, nutrientName: "Glucides", value: 4.2, unitName: "g" },
            { nutrientId: 4, nutrientName: "Lipides", value: 0.2, unitName: "g" },
            { nutrientId: 5, nutrientName: "Fibres", value: 1.3, unitName: "g" },
        ]
    },
    // ... (ajouter le reste de ta base locale)
];

// Fonction pour déterminer les unités communes selon l'ingrédient
const getCommonUnits = (name: string): string[] => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('huile') || lowerName.includes('lait') || lowerName.includes('vinaigre')) {
        return ['ml', 'cl', 'l', 'cuillère à café', 'cuillère à soupe'];
    }

    if (lowerName.includes('sel') || lowerName.includes('poivre') || lowerName.includes('épice')) {
        return ['g', 'cuillère à café', 'cuillère à soupe', 'pincée'];
    }

    if (lowerName.includes('œuf')) {
        return ['pièce', 'g'];
    }

    if (lowerName.includes('pomme') || lowerName.includes('tomate') || lowerName.includes('oignon')) {
        return ['g', 'kg', 'pièce'];
    }

    return ['g', 'kg', 'cuillère à café', 'cuillère à soupe', 'tasse'];
};

// Fonction pour convertir FoodItem vers IngredientSuggestion
const transformFoodItem = (item: FoodItem, source: 'local' | 'openfoodfacts'): IngredientSuggestion => {
    const nutrients = item.foodNutrients;

    const getNutrientValue = (name: string): number => {
        const nutrient = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
        return nutrient ? nutrient.value : 0;
    };

    return {
        id: `${source}-${item.fdcId}`,
        name: item.description.toLowerCase(),
        calories: Math.round(getNutrientValue('énergie')),
        proteins: Math.round(getNutrientValue('protéines') * 10) / 10,
        carbs: Math.round(getNutrientValue('glucides') * 10) / 10,
        fat: Math.round(getNutrientValue('lipides') * 10) / 10,
        fiber: Math.round(getNutrientValue('fibres') * 10) / 10,
        commonUnits: getCommonUnits(item.description),
        source
    };
};

export const useNutrition = (initialSearchTerm: string = '') => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
    const [useLocalData, setUseLocalData] = useState(false);

    // Debounce pour éviter trop de requêtes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 🔥 NOUVELLE REQUÊTE VERS TON PROXY (plus directement vers OpenFoodFacts)
    const { data: apiData, isLoading: apiIsLoading, error: apiError } = useQuery({
        queryKey: ['nutrition-proxy', debouncedTerm],
        queryFn: async (): Promise<FoodItem[]> => {
            if (!debouncedTerm || debouncedTerm.length < 2) return [];

            try {
                console.log(`🔍 Recherche via proxy: ${debouncedTerm}`);

                // 📡 Appel vers TON PROXY au lieu d'OpenFoodFacts directement
                const response = await fetch(
                    `/api/openfoodfacts/search?q=${encodeURIComponent(debouncedTerm)}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Erreur proxy: ${response.status}`);
                }

                const data: ProxyApiResponse = await response.json();

                console.log(`✅ Proxy response: ${data.count} produits`);

                // Transformer les données du proxy en format FoodItem
                return data.products || [];

            } catch (error) {
                console.error("❌ Erreur proxy:", error);
                setUseLocalData(true);
                return [];
            }
        },
        enabled: debouncedTerm.length >= 2 && !useLocalData,
        retry: 2,
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000, // Cache 5 minutes
    });

    // Recherche dans les données locales (garde la même logique)
    const localResults = debouncedTerm.length >= 2
        ? commonFrenchIngredients
            .filter(item => {
                const itemName = item.description.toLowerCase();
                const searchTerm = debouncedTerm.toLowerCase();

                return itemName.includes(searchTerm) ||
                    searchTerm.split(' ').some(word =>
                        word.length >= 3 && itemName.includes(word)
                    );
            })
            .sort((a, b) => {
                const aName = a.description.toLowerCase();
                const bName = b.description.toLowerCase();
                const searchTerm = debouncedTerm.toLowerCase();

                if (aName === searchTerm && bName !== searchTerm) return -1;
                if (aName !== searchTerm && bName === searchTerm) return 1;

                const aStartsWithTerm = aName.startsWith(searchTerm);
                const bStartsWithTerm = bName.startsWith(searchTerm);
                if (aStartsWithTerm && !bStartsWithTerm) return -1;
                if (!aStartsWithTerm && bStartsWithTerm) return 1;

                return 0;
            })
        : [];

    // Gestion automatique du fallback vers les données locales
    useEffect(() => {
        if (apiError && !useLocalData) {
            console.warn("⚠️ Proxy indisponible, basculement vers données locales");
            setUseLocalData(true);
        }
    }, [apiError, useLocalData]);

    // Combinaison intelligente des résultats
    const combinedResults = (() => {
        const localSuggestions = localResults.map(item => transformFoodItem(item, 'local'));

        if (useLocalData) {
            return localSuggestions;
        }

        if (!apiData || apiData.length === 0) {
            return localSuggestions;
        }

        // Transformer les données de l'API (qui viennent déjà transformées du proxy)
        const apiSuggestions = apiData
            .map(item => transformFoodItem(item, 'openfoodfacts'))
            .filter(apiItem =>
                !localSuggestions.some(localItem =>
                    localItem.name.toLowerCase().trim() === apiItem.name.toLowerCase().trim()
                )
            );

        return [...localSuggestions, ...apiSuggestions].slice(0, 10);
    })();

    const resetLocalData = () => {
        if (useLocalData) {
            setUseLocalData(false);
            console.info("🔄 Tentative de reconnexion au proxy");
        }
    };

    return {
        suggestions: combinedResults,
        isLoading: apiIsLoading && !useLocalData,
        setSearchTerm,
        error: apiError,
        isUsingLocalData: useLocalData,
        resetLocalData,
        debug: {
            searchTerm: debouncedTerm,
            localResults: localResults.length,
            apiResults: apiData?.length || 0,
            combinedResults: combinedResults.length
        }
    };
};