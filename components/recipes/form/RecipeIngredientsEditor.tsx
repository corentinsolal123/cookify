// components/recipes/edit/RecipeIngredientsEditor.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Search, Loader2, AlertCircle } from 'lucide-react';
import { IngredientData } from '@/types/ingredient';

interface RecipeIngredientsEditorProps {
    ingredients: IngredientData[];
    servings: number;
    error?: string;
    onChange: (ingredients: IngredientData[]) => void;
}

// Interface pour les suggestions d'ingrédients
interface IngredientSuggestion {
    name: string;
    calories: number;
    commonUnits: string[];
}

// Unités courantes avec leurs abréviations
const COMMON_UNITS = [
    { value: 'g', label: 'grammes (g)' },
    { value: 'kg', label: 'kilogrammes (kg)' },
    { value: 'ml', label: 'millilitres (ml)' },
    { value: 'cl', label: 'centilitres (cl)' },
    { value: 'l', label: 'litres (l)' },
    { value: 'cuillère à café', label: 'cuillères à café' },
    { value: 'cuillère à soupe', label: 'cuillères à soupe' },
    { value: 'tasse', label: 'tasses' },
    { value: 'pièce', label: 'pièces' },
    { value: 'tranche', label: 'tranches' }
];

export default function RecipeIngredientsEditor({
                                                    ingredients,
                                                    servings,
                                                    error,
                                                    onChange
                                                }: RecipeIngredientsEditorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Fonction pour rechercher des ingrédients via API
    const searchIngredients = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoadingSuggestions(true);

        try {
            const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(query)}`);

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche d\'ingrédients:', error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Debounce pour la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery && showSuggestions) {
                searchIngredients(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, showSuggestions]);

    // Fermer les suggestions en cliquant à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                !searchInputRef.current?.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Ajouter un nouvel ingrédient
    const addIngredient = (suggestion?: IngredientSuggestion) => {
        const newIngredient: IngredientData = {
            name: suggestion?.name || searchQuery || '',
            quantityPerServing: 0,
            unit: suggestion?.commonUnits[0] || 'g',
            calories: suggestion?.calories || 0
        };

        onChange([...ingredients, newIngredient]);
        setSearchQuery('');
        setShowSuggestions(false);
    };

    // Modifier un ingrédient
    const updateIngredient = (index: number, updates: Partial<IngredientData>) => {
        const updatedIngredients = ingredients.map((ingredient, i) =>
            i === index ? { ...ingredient, ...updates } : ingredient
        );
        onChange(updatedIngredients);
    };

    // Supprimer un ingrédient
    const removeIngredient = (index: number) => {
        const filteredIngredients = ingredients.filter((_, i) => i !== index);
        onChange(filteredIngredients);
    };

    // Calculer les calories totales
    const totalCalories = ingredients.reduce((total, ingredient) =>
        total + (ingredient.calories * (ingredient.quantityPerServing / 100) * servings), 0
    );

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            I
          </span>
                    Ingrédients
                </h2>

                {/* Résumé nutritionnel */}
                <div className="text-sm text-gray-600">
                    <span className="font-medium">{Math.round(totalCalories)}</span> cal total
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Rechercher un ingrédient (ex: farine, tomates...)"
                    />

                    {loadingSuggestions && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                    )}
                </div>

                {/* Suggestions d'ingrédients */}
                {showSuggestions && (searchQuery.length > 0 || suggestions.length > 0) && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                    >
                        {loadingSuggestions ? (
                            <div className="p-4 text-center text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                                Recherche en cours...
                            </div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => addIngredient(suggestion)}
                                    className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{suggestion.name}</span>
                                        <span className="text-sm text-gray-500">{suggestion.calories} cal/100g</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Unités courantes: {suggestion.commonUnits.join(', ')}
                                    </div>
                                </button>
                            ))
                        ) : searchQuery.length > 0 ? (
                            <div className="p-4">
                                <button
                                    onClick={() => addIngredient()}
                                    className="w-full p-2 text-left text-blue-600 hover:bg-blue-50 rounded"
                                >
                                    Ajouter "{searchQuery}" manuellement
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Liste des ingrédients */}
            <div className="space-y-3 mb-6">
                {ingredients.map((ingredient, index) => (
                    <div
                        key={index}
                        className={`p-4 border-2 rounded-lg transition-all ${
                            activeIngredientIndex === index
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">

                            {/* Nom de l'ingrédient */}
                            <div className="md:col-span-5">
                                <input
                                    type="text"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(index, { name: e.target.value })}
                                    onFocus={() => setActiveIngredientIndex(index)}
                                    onBlur={() => setActiveIngredientIndex(null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nom de l'ingrédient"
                                />
                            </div>

                            {/* Quantité */}
                            <div className="md:col-span-2">
                                <input
                                    type="number"
                                    value={ingredient.quantityPerServing || ''}
                                    onChange={(e) => updateIngredient(index, {
                                        quantityPerServing: parseFloat(e.target.value) || 0
                                    })}
                                    onFocus={() => setActiveIngredientIndex(index)}
                                    onBlur={() => setActiveIngredientIndex(null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Qté"
                                    min="0"
                                    step="0.1"
                                />
                            </div>

                            {/* Unité */}
                            <div className="md:col-span-3">
                                <select
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                                    onFocus={() => setActiveIngredientIndex(index)}
                                    onBlur={() => setActiveIngredientIndex(null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {COMMON_UNITS.map(unit => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Calories et bouton supprimer */}
                            <div className="md:col-span-2 flex items-center gap-2">
                                <div className="text-xs text-gray-500 text-center flex-1">
                                    {Math.round(ingredient.calories * (ingredient.quantityPerServing / 100))} cal
                                </div>
                                <button
                                    onClick={() => removeIngredient(index)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Supprimer cet ingrédient"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Détails nutritionnels si disponibles */}
                        {ingredient.calories > 0 && activeIngredientIndex === index && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-xs text-gray-600 grid grid-cols-2 gap-4">
                                    <div>Calories: {ingredient.calories}/100g</div>
                                    <div>Total: {Math.round(ingredient.calories * (ingredient.quantityPerServing / 100) * servings)} cal</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Message si aucun ingrédient */}
                {ingredients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Aucun ingrédient ajouté</p>
                        <p className="text-sm">Utilise la barre de recherche ci-dessus pour commencer</p>
                    </div>
                )}
            </div>

            {/* Bouton d'ajout rapide */}
            <button
                onClick={() => addIngredient()}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Ajouter un ingrédient manuellement
            </button>

            {/* Erreur */}
            {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            {/* Résumé nutritionnel */}
            {ingredients.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Informations nutritionnelles</span>
                        <span className="text-sm text-gray-600">Pour {servings} portion{servings > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Calories totales: </span>
                            <span className="font-medium">{Math.round(totalCalories)}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Par portion: </span>
                            <span className="font-medium">{Math.round(totalCalories / servings)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}