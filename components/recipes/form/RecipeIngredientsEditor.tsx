// components/recipes/form/RecipeIngredientsEditor.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Plus, Search, X, Info, RefreshCw } from "lucide-react";
import { IngredientData } from "@/types/ingredient";
import { useNutrition, IngredientSuggestion, suggestionToIngredientData } from "@/lib/hooks/useNutrition";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Avatar } from "@heroui/avatar";

interface RecipeIngredientsEditorProps {
    ingredients: IngredientData[];
    servings: number;
    error?: string;
    onChange: (ingredients: IngredientData[]) => void;
}

// Unités courantes avec leurs abréviations
const COMMON_UNITS = [
    { value: "g", label: "grammes (g)" },
    { value: "kg", label: "kilogrammes (kg)" },
    { value: "ml", label: "millilitres (ml)" },
    { value: "cl", label: "centilitres (cl)" },
    { value: "l", label: "litres (l)" },
    { value: "cuillère à café", label: "cuillères à café" },
    { value: "cuillère à soupe", label: "cuillères à soupe" },
    { value: "tasse", label: "tasses" },
    { value: "pièce", label: "pièces" },
    { value: "tranche", label: "tranches" },
    { value: "pincée", label: "pincées" }
];

export default function RecipeIngredientsEditor({
                                                    ingredients,
                                                    servings,
                                                    error,
                                                    onChange
                                                }: Readonly<RecipeIngredientsEditorProps>) {
    const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);
    const [searchValue, setSearchValue] = useState("");

    // Utilisation du hook de nutrition adapté
    const {
        suggestions,
        isLoading,
        setSearchTerm,
        isUsingLocalData,
        resetLocalData
    } = useNutrition();

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Synchroniser la recherche avec le hook
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        setSearchTerm(value);
    };

    // Ajouter un ingrédient depuis les suggestions
    const addIngredientFromSuggestion = (suggestion: IngredientSuggestion) => {
        const defaultUnit = suggestion.commonUnits[0] || "g";
        const newIngredient = suggestionToIngredientData(suggestion, 100, defaultUnit);

        onChange([...ingredients, newIngredient]);
        setSearchValue("");
        setSearchTerm("");
    };

    // Ajouter un ingrédient manuellement
    const addManualIngredient = () => {
        if (!searchValue.trim()) return;

        const newIngredient: IngredientData = {
            name: searchValue.toLowerCase().trim(),
            quantityPerServing: 100,
            unit: "g",
            calories: 0,
            proteins: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };

        onChange([...ingredients, newIngredient]);
        setSearchValue("");
        setSearchTerm("");
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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            I
                        </span>
                        Ingrédients
                    </h2>

                    <div className="flex items-center gap-2">
                        {/* Résumé nutritionnel */}
                        <Chip color="success" variant="flat">
                            {Math.round(totalCalories)} cal
                        </Chip>
                        <Chip color="primary" variant="flat">
                            {ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}
                        </Chip>

                        {/* Indicateur de source de données */}
                        {isUsingLocalData && (
                            <Chip
                                color="warning"
                                variant="flat"
                                className="cursor-pointer"
                                onClick={resetLocalData}
                                startContent={<RefreshCw className="w-3 h-3" />}
                            >
                                Mode local
                            </Chip>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardBody className="space-y-6">
                {/* Barre de recherche avec autocomplete */}
                <div className="relative">
                    <Autocomplete
                        ref={searchInputRef}
                        label="Rechercher un ingrédient"
                        placeholder="Ex: tomates, farine, beurre, pulpe de tomate..."
                        startContent={<Search className="w-4 h-4 text-default-400" />}
                        inputValue={searchValue}
                        onInputChange={handleSearchChange}
                        isLoading={isLoading}
                        items={suggestions}
                        onSelectionChange={(key) => {
                            if (!key) return;
                            const suggestion = suggestions.find(s => s.id === key);
                            if (suggestion) {
                                addIngredientFromSuggestion(suggestion);
                            }
                        }}
                        allowsCustomValue
                    >
                        {(suggestion) => (
                            <AutocompleteItem
                                key={suggestion.id}
                                textValue={suggestion.name}
                                startContent={
                                    suggestion.imageUrl ? (
                                        <Avatar src={suggestion.imageUrl} size="sm" />
                                    ) : (
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            🥄
                                        </div>
                                    )
                                }
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{suggestion.name}</span>
                                        <span className="text-xs text-default-500">
                                            {suggestion.calories} cal/100g
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <Chip
                                            size="sm"
                                            color={
                                                suggestion.source === 'local' ? 'primary' :
                                                    suggestion.source === 'openfoodfacts' ? 'success' : 'default'
                                            }
                                            variant="flat"
                                        >
                                            {suggestion.source === 'local' ? 'Base Cookify' :
                                                suggestion.source === 'openfoodfacts' ? 'OpenFoodFacts' : 'Manuel'}
                                        </Chip>

                                        {suggestion.brand && (
                                            <span className="text-xs text-default-400">{suggestion.brand}</span>
                                        )}
                                    </div>

                                    {/* Infos nutritionnelles rapides */}
                                    {suggestion.source !== 'manual' && (
                                        <div className="text-xs text-default-500 mt-1">
                                            P: {suggestion.proteins}g • G: {suggestion.carbs}g • L: {suggestion.fat}g • F: {suggestion.fiber}g
                                        </div>
                                    )}
                                </div>
                            </AutocompleteItem>
                        )}
                    </Autocomplete>

                    {/* Option d'ajout manuel */}
                    {searchValue.trim().length >= 2 && (
                        <div className="mt-2 flex gap-2">
                            <Button
                                onPress={addManualIngredient}
                                variant="bordered"
                                size="sm"
                                startContent={<Plus className="w-4 h-4" />}
                                className="flex-1"
                            >
                                Ajouter "{searchValue}" manuellement
                            </Button>

                            {suggestions.length === 0 && !isLoading && (
                                <Chip size="sm" color="warning" variant="flat">
                                    Aucun résultat trouvé
                                </Chip>
                            )}
                        </div>
                    )}
                </div>

                {/* Liste des ingrédients */}
                <div className="space-y-3">
                    {ingredients.map((ingredient, index) => (
                        <Card key={index} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">

                                {/* Nom de l'ingrédient */}
                                <div className="md:col-span-4">
                                    <Input
                                        type="text"
                                        value={ingredient.name}
                                        onChange={(e) => updateIngredient(index, { name: e.target.value })}
                                        onFocus={() => setActiveIngredientIndex(index)}
                                        onBlur={() => setActiveIngredientIndex(null)}
                                        placeholder="Nom de l'ingrédient"
                                        size="sm"
                                    />
                                </div>

                                {/* Quantité */}
                                <div className="md:col-span-2">
                                    <Input
                                        type="number"
                                        value={ingredient.quantityPerServing?.toString() || ""}
                                        onChange={(e) => updateIngredient(index, {
                                            quantityPerServing: parseFloat(e.target.value) || 0
                                        })}
                                        onFocus={() => setActiveIngredientIndex(index)}
                                        onBlur={() => setActiveIngredientIndex(null)}
                                        placeholder="Qté"
                                        min="0"
                                        step="0.1"
                                        size="sm"
                                    />
                                </div>

                                {/* Unité */}
                                <div className="md:col-span-2">
                                    <select
                                        value={ingredient.unit}
                                        onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                                        onFocus={() => setActiveIngredientIndex(index)}
                                        onBlur={() => setActiveIngredientIndex(null)}
                                        className="w-full px-3 py-2 text-sm border border-default-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        {COMMON_UNITS.map(unit => (
                                            <option key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Calories et actions */}
                                <div className="md:col-span-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-default-500">
                                            <div>{Math.round(ingredient.calories * (ingredient.quantityPerServing / 100))} cal</div>
                                            <div className="text-tiny opacity-60">
                                                {ingredient.calories}/100g
                                            </div>
                                        </div>

                                        <Button
                                            isIconOnly
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            onPress={() => removeIngredient(index)}
                                            aria-label="Supprimer cet ingrédient"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Champs nutritionnels pour ingrédients manuels (calories = 0) */}
                                {ingredient.calories === 0 && (
                                    <div className="md:col-span-12 mt-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <Input
                                                type="number"
                                                label="Calories/100g"
                                                value={ingredient.calories?.toString() || ""}
                                                onChange={(e) => updateIngredient(index, {
                                                    calories: parseFloat(e.target.value) || 0
                                                })}
                                                placeholder="0"
                                                size="sm"
                                                min="0"
                                            />
                                            <Input
                                                type="number"
                                                label="Protéines/100g"
                                                value={ingredient.proteins?.toString() || ""}
                                                onChange={(e) => updateIngredient(index, {
                                                    proteins: parseFloat(e.target.value) || 0
                                                })}
                                                placeholder="0"
                                                size="sm"
                                                min="0"
                                                step="0.1"
                                            />
                                            <Input
                                                type="number"
                                                label="Glucides/100g"
                                                value={ingredient.carbs?.toString() || ""}
                                                onChange={(e) => updateIngredient(index, {
                                                    carbs: parseFloat(e.target.value) || 0
                                                })}
                                                placeholder="0"
                                                size="sm"
                                                min="0"
                                                step="0.1"
                                            />
                                            <Input
                                                type="number"
                                                label="Lipides/100g"
                                                value={ingredient.fat?.toString() || ""}
                                                onChange={(e) => updateIngredient(index, {
                                                    fat: parseFloat(e.target.value) || 0
                                                })}
                                                placeholder="0"
                                                size="sm"
                                                min="0"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Détails nutritionnels détaillés au clic */}
                            {activeIngredientIndex === index && (ingredient.proteins > 0 || ingredient.carbs > 0 || ingredient.fat > 0) && (
                                <div className="mt-3 pt-3 border-t border-divider">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-primary">
                                                {Math.round(ingredient.calories * (ingredient.quantityPerServing / 100))}
                                            </div>
                                            <div className="text-default-500">Calories</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-secondary">
                                                {(ingredient.proteins * (ingredient.quantityPerServing / 100)).toFixed(1)}g
                                            </div>
                                            <div className="text-default-500">Protéines</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-warning">
                                                {(ingredient.carbs * (ingredient.quantityPerServing / 100)).toFixed(1)}g
                                            </div>
                                            <div className="text-default-500">Glucides</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-danger">
                                                {(ingredient.fat * (ingredient.quantityPerServing / 100)).toFixed(1)}g
                                            </div>
                                            <div className="text-default-500">Lipides</div>
                                        </div>
                                    </div>

                                    {ingredient.fiber > 0 && (
                                        <div className="mt-2 text-center">
                                            <span className="text-xs text-default-500">
                                                Fibres: {(ingredient.fiber * (ingredient.quantityPerServing / 100)).toFixed(1)}g
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}

                    {/* Message si aucun ingrédient */}
                    {ingredients.length === 0 && (
                        <Card className="p-8">
                            <div className="text-center text-default-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-default-400" />
                                <p>Aucun ingrédient ajouté</p>
                                <p className="text-sm">Utilise la barre de recherche ci-dessus pour commencer</p>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Erreur */}
                {error && (
                    <Chip color="danger" variant="bordered" className="w-full justify-start">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                    </Chip>
                )}

                {/* Résumé nutritionnel complet */}
                {ingredients.length > 0 && (
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Informations nutritionnelles
                            </h4>
                            <span className="text-sm text-default-500">
                                Pour {servings} portion{servings > 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                    {Math.round(totalCalories)}
                                </div>
                                <div className="text-xs text-default-500">Calories totales</div>
                                <div className="text-sm font-medium text-primary">
                                    {Math.round(totalCalories / servings)} par portion
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-secondary">
                                    {ingredients.reduce((sum, ing) => sum + (ing.proteins || 0) * (ing.quantityPerServing / 100) * servings, 0).toFixed(1)}g
                                </div>
                                <div className="text-xs text-default-500">Protéines totales</div>
                                <div className="text-sm font-medium text-secondary">
                                    {(ingredients.reduce((sum, ing) => sum + (ing.proteins || 0) * (ing.quantityPerServing / 100) * servings, 0) / servings).toFixed(1)}g par portion
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-warning">
                                    {ingredients.reduce((sum, ing) => sum + (ing.carbs || 0) * (ing.quantityPerServing / 100) * servings, 0).toFixed(1)}g
                                </div>
                                <div className="text-xs text-default-500">Glucides totaux</div>
                                <div className="text-sm font-medium text-warning">
                                    {(ingredients.reduce((sum, ing) => sum + (ing.carbs || 0) * (ing.quantityPerServing / 100) * servings, 0) / servings).toFixed(1)}g par portion
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-danger">
                                    {ingredients.reduce((sum, ing) => sum + (ing.fat || 0) * (ing.quantityPerServing / 100) * servings, 0).toFixed(1)}g
                                </div>
                                <div className="text-xs text-default-500">Lipides totaux</div>
                                <div className="text-sm font-medium text-danger">
                                    {(ingredients.reduce((sum, ing) => sum + (ing.fat || 0) * (ing.quantityPerServing / 100) * servings, 0) / servings).toFixed(1)}g par portion
                                </div>
                            </div>
                        </div>

                        {/* Fibres si présentes */}
                        {ingredients.some(ing => ing.fiber > 0) && (
                            <div className="mt-4 text-center">
                                <div className="text-lg font-bold text-success">
                                    {ingredients.reduce((sum, ing) => sum + (ing.fiber || 0) * (ing.quantityPerServing / 100) * servings, 0).toFixed(1)}g
                                </div>
                                <div className="text-xs text-default-500">
                                    Fibres totales ({(ingredients.reduce((sum, ing) => sum + (ing.fiber || 0) * (ing.quantityPerServing / 100) * servings, 0) / servings).toFixed(1)}g par portion)
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* Info sources de données */}
                <div className="flex items-center justify-between text-xs text-default-500">
                    <div className="flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        <span>
                            {isUsingLocalData
                                ? "Données nutritionnelles : Base Cookify (mode hors ligne)"
                                : "Données nutritionnelles : Base Cookify + OpenFoodFacts"
                            }
                        </span>
                    </div>

                    {isUsingLocalData && (
                        <Button
                            size="sm"
                            variant="light"
                            onPress={resetLocalData}
                            startContent={<RefreshCw className="w-3 h-3" />}
                            className="text-xs"
                        >
                            Réessayer l'API
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}