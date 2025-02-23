"use client";

import { Avatar, Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { RecipeData } from "@/types/recipe";
import { IngredientData } from "@/types/ingredient";

interface RecipeFormProps {
    onSubmit: (data: RecipeData) => void;
    existingIngredients: any[];
    // On ajoute ces deux props :
    initialData: RecipeData;
    isNew: boolean;
}

export default function RecipeForm({
                                       onSubmit,
                                       existingIngredients,
                                       initialData,
                                       isNew
                                   }: RecipeFormProps) {
    // On initialise les états avec les données reçues
    const [name, setName] = useState(initialData.name || "");
    const [description, setDescription] = useState(initialData.description || "");
    const [difficulty, setDifficulty] = useState(initialData.difficulty || "");
    const [prepTime, setPrepTime] = useState(initialData.prepTime || 0);
    const [cookTime, setCookTime] = useState(initialData.cookTime || 0);
    const [calories, setCalories] = useState(initialData.calories || 0);
    const [creator, setCreator] = useState(initialData.creator || "");

    // Steps
    const [steps, setSteps] = useState<string[]>(initialData.steps || [""]);

    // Ingrédients
    const [ingredients, setIngredients] = useState<IngredientData[]>(
        initialData.ingredients || [{ name: "", quantityPerServing: 0, unit: "" }]
    );

    // Fonctions pour gérer les steps
    const addStep = () => setSteps([...steps, ""]);
    const updateStep = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };
    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    // Fonctions pour gérer les ingrédients
    const addIngredient = () =>
        setIngredients([...ingredients, { name: "", quantityPerServing: 0, unit: "" }]);
    const updateIngredient = (
        index: number,
        field: keyof IngredientData,
        value: string | number
    ) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };
    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    // Soumission du formulaire
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // On reconstitue l’objet complet
        const recipeData: RecipeData = {
            name,
            description,
            difficulty,
            prepTime,
            cookTime,
            calories,
            creator,
            steps,
            ingredients
            // image: ... (à gérer si besoin)
        };

        onSubmit(recipeData);
    }

    return (
        <form onSubmit={handleSubmit} className="container mx-auto p-6 grid grid-cols-12 gap-3">
            {/* Image et infos pratiques */}
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardBody className="p-4">
                        <Input type="file" accept="image/*" className="w-full" />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 space-y-2">
                        <Input
                            label="Difficulté"
                            labelPlacement="outside"
                            placeholder="Difficulté"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        />
                        <Input
                            label={"Temps de préparation (min)"}
                            labelPlacement="outside"
                            type="number"
                            placeholder="⏱ Préparation (min)"
                            value={prepTime.toString()}
                            onChange={(e) => setPrepTime(Number(e.target.value))}
                        />
                        <Input
                            label={"temps de cuisson (min)"}
                            labelPlacement="outside"
                            type="number"
                            placeholder="🔥 Cuisson (min)"
                            value={cookTime.toString()}
                            onChange={(e) => setCookTime(Number(e.target.value))}
                        />
                        <Input
                            label={"Nb de calories"}
                            type="number"
                            placeholder="⚡ Calories"
                            value={calories.toString()}
                            onChange={(e) => setCalories(Number(e.target.value))}
                        />
                        <div className="flex items-center space-x-2">
                            <Avatar size="sm" />
                            <Input
                                placeholder="Créateur"
                                value={creator}
                                onChange={(e) => setCreator(e.target.value)}
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Étapes de préparation */}
            <div className="col-span-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">Étapes de préparation</h2>
                    </CardHeader>
                    <CardBody>
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <Input
                                    placeholder={`Étape ${index + 1}`}
                                    value={step}
                                    onChange={(e) => updateStep(index, e.target.value)}
                                />
                                <Button onPress={() => removeStep(index)} type="button">
                                    ❌
                                </Button>
                            </div>
                        ))}
                        <Button onPress={addStep} type="button">
                            Ajouter une étape
                        </Button>
                    </CardBody>
                </Card>
            </div>

            {/* Liste des ingrédients */}
            <div className="col-span-3">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold">Ingrédients</h2>
                    </CardHeader>
                    <CardBody>
                        {ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                                <Input
                                    placeholder="Nom"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                                    list="ingredient-options"
                                />
                                <Input
                                    type="number"
                                    placeholder="Quantité"
                                    value={ingredient.quantityPerServing.toString()}
                                    onChange={(e) =>
                                        updateIngredient(index, "quantityPerServing", Number(e.target.value))
                                    }
                                />
                                <Select
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                                >
                                    <SelectItem key="g">g</SelectItem>
                                    <SelectItem key="ml">ml</SelectItem>
                                    <SelectItem key="pcs">pcs</SelectItem>
                                </Select>
                                <Button onPress={() => removeIngredient(index)} type="button">
                                    ❌
                                </Button>
                            </div>
                        ))}
                        <datalist id="ingredient-options">
                            {existingIngredients.map((ing, idx) => (
                                <option key={idx} value={ing.name} />
                            ))}
                        </datalist>
                        <Button onPress={addIngredient} type="button">
                            Ajouter un ingrédient
                        </Button>
                    </CardBody>
                </Card>
            </div>

            <div className="col-span-12 flex justify-end">
                <Button type="submit">
                    {isNew ? "Créer la recette" : "Enregistrer les modifications"}
                </Button>
            </div>
        </form>
    );
}
