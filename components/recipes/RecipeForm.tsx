"use client";

import { Avatar, Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from "@heroui/react";
import React, { useState } from "react";
import { RecipeData } from "@/types/recipe";
import { IngredientData } from "@/types/ingredient";

interface RecipeFormProps {
    onSubmit: (data: RecipeData) => void;
    initialData: RecipeData;
    isNew: boolean;
}

export default function RecipeForm({ onSubmit, initialData, isNew }: RecipeFormProps) {
    const [name, setName] = useState(initialData.name || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [difficulty, setDifficulty] = useState(initialData.difficulty || "");
    const [prepTime, setPrepTime] = useState(initialData.prepTime || 0);
    const [cookTime, setCookTime] = useState(initialData.cookTime || 0);
    const [calories, setCalories] = useState(initialData.calories || 0);
    const [creator, setCreator] = useState(initialData.creator || "");
    const [steps, setSteps] = useState<string[]>(initialData.steps || [""]);
    const [ingredients, setIngredients] = useState<IngredientData[]>(initialData.ingredients || []);

    // 🔍 Recherche d’ingrédients
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<IngredientData[]>([]);
    const [loading, setLoading] = useState(false);

    const searchIngredients = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/ingredients?q=${query}`);
            const data = await res.json();
            if (res.ok) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
                console.error(data.error);
            }
        } catch (error) {
            console.error("Erreur de recherche :", error);
        }
        setLoading(false);
    };

    // ➕ Ajouter un ingrédient
    const addIngredient = (ingredient: IngredientData) => {
        setIngredients([
            ...ingredients,
            { name: ingredient.name, calories: ingredient.calories, quantityPerServing: 100, unit: "g" }
        ]);
        setQuery("");
        setSearchResults([]);
    };

    // 🔄 Mettre à jour un ingrédient
    const updateIngredient = (index: number, field: keyof IngredientData, value: string | number) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    // ❌ Supprimer un ingrédient
    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    // 📝 Soumettre le formulaire
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const recipeData: RecipeData = { name, description, difficulty, prepTime, cookTime, calories, creator, steps, ingredients };
        onSubmit(recipeData);
    }

    return (
        <Card isBlurred>
            <CardBody>
                <form onSubmit={handleSubmit} className="container mx-auto p-3 grid grid-cols-12 gap-3">

                    {/* 📌 Nom & Infos principales */}
                    <div className="col-span-3 space-y-5">
                        <Card>
                            <CardBody className="p-4 space-y-4">
                                <Input type="file" accept="image/*" className="w-full" />
                                <Input type="text" label="Nom de la recette" value={name}
                                       onChange={(e) => setName(e.target.value)} />
                            </CardBody>
                        </Card>
                        <Card className="space-y-2">
                            <CardBody className="p-4 space-y-4">
                                <Input label="Difficulté" placeholder="Difficulté"
                                       value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
                                <Input label="Préparation (min)" type="number" value={prepTime.toString()}
                                       onChange={(e) => setPrepTime(Number(e.target.value))} />
                                <Input label="Cuisson (min)" type="number" value={cookTime.toString()}
                                       onChange={(e) => setCookTime(Number(e.target.value))} />
                                <Input label="Calories" type="number" value={calories.toString()}
                                       onChange={(e) => setCalories(Number(e.target.value))} />
                                <div className="flex items-center space-x-2">
                                    <Avatar size="sm" />
                                    <Input placeholder="Créateur" value={creator}
                                           onChange={(e) => setCreator(e.target.value)} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* 📜 Étapes de préparation */}
                    <div className="col-span-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Étapes de préparation</h2>
                            </CardHeader>
                            <CardBody>
                                {steps.map((step, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <Input placeholder={`Étape ${index + 1}`} value={step}
                                               onChange={(e) => {
                                                   const newSteps = [...steps];
                                                   newSteps[index] = e.target.value;
                                                   setSteps(newSteps);
                                               }} />
                                        <Button onPress={() => setSteps(steps.filter((_, i) => i !== index))}>❌</Button>
                                    </div>
                                ))}
                                <Button onPress={() => setSteps([...steps, ""])}>Ajouter une étape</Button>
                            </CardBody>
                        </Card>
                    </div>

                    {/* 🔍 Recherche & liste des ingrédients */}
                    <div className="col-span-3">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold">Ingrédients</h2>
                            </CardHeader>
                            <CardBody>

                                {/* Champ de recherche */}
                                <Input placeholder="Rechercher un ingrédient..."
                                       value={query} onChange={(e) => setQuery(e.target.value)} />
                                <Button onPress={searchIngredients} className="mt-2">🔍 Rechercher</Button>

                                {/* Résultats de la recherche */}
                                {loading && <p>Chargement...</p>}
                                {searchResults.length > 0 && (
                                    <div className=" p-2 rounded-md mt-2">
                                        {searchResults.map((ingredient, index) => (
                                            <div key={index} className="flex justify-between p-2 border-b">
                                                <span>{ingredient.name} - {ingredient.calories} kcal</span>
                                                <Button onPress={() => addIngredient(ingredient)}>➕ Ajouter</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Liste des ingrédients sélectionnés */}
                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <span className="w-1/3">{ingredient.name}</span>
                                        <Input type="number" placeholder="Quantité"
                                               value={ingredient.quantityPerServing.toString()}
                                               onChange={(e) => updateIngredient(index, "quantityPerServing", Number(e.target.value))} />
                                        <Select value={ingredient.unit}
                                                onChange={(e) => updateIngredient(index, "unit", e.target.value)}>
                                            <SelectItem key="g">g</SelectItem>
                                            <SelectItem key="ml">ml</SelectItem>
                                            <SelectItem key="pcs">pcs</SelectItem>
                                        </Select>
                                        <Button onPress={() => removeIngredient(index)}>❌</Button>
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>

                    {/* ✅ Validation */}
                    <div className="col-span-12 flex justify-end">
                        <Button type="submit">{isNew ? "Créer la recette" : "Enregistrer"}</Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
