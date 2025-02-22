"use client";

import { Avatar, Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { IIngredient, IRecipe } from "@/types/recipe";


interface RecipeFormProps {
    onSubmit: (data: IRecipe) => void;
    existingIngredients: any[];
}

export default function RecipeForm({ onSubmit, existingIngredients }: RecipeFormProps) {
    const [steps, setSteps] = useState<string[]>([""]);
    const [ingredients, setIngredients] = useState<IIngredient[]>([{ name: "", quantity: 0, unite: "" }]);

    const addStep = () => setSteps([...steps, ""]);
    const updateStep = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
    };
    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: 0, unite: "" }]);
    const updateIngredient = (index: number, field: keyof IIngredient, value: string | number) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };
    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    return (
        <form className="container mx-auto p-6 grid grid-cols-12 gap-6">
            {/* Image et infos pratiques */}
            <div className="col-span-3 space-y-4">
                <Card>
                    <CardBody className="p-4">
                        <Input type="file" accept="image/*" className="w-full" />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="p-4 space-y-2">
                        <Input placeholder="Difficulté" />
                        <Input type="number" placeholder="⏱ Préparation (min)" />
                        <Input type="number" placeholder="🔥 Cuisson (min)" />
                        <Input type="number" placeholder="⚡ Calories" />
                        <div className="flex items-center space-x-2">
                            <Avatar size="sm" />
                            <Input placeholder="Créateur" />
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
                            <div key={index} className="flex items-center space-x-2">
                                <Input
                                    placeholder={`Étape ${index + 1}`}
                                    value={step}
                                    onChange={(e) => updateStep(index, e.target.value)}
                                />
                                <Button onPress={() => removeStep(index)} type="button">❌</Button>
                            </div>
                        ))}
                        <Button onPress={addStep} type="button">Ajouter une étape</Button>
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
                            <div key={index} className="flex items-center space-x-2">
                                <Input
                                    placeholder="Nom"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                                    list="ingredient-options"
                                />
                                <Input
                                    type="number"
                                    placeholder="Quantité"
                                    value={ingredient.quantity.toString()}
                                    onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                                />
                                <Select
                                    value={ingredient.unite}
                                    onChange={(e) => updateIngredient(index, "unite", e.target.value)}
                                >
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="pcs">pcs</SelectItem>
                                </Select>
                                <Button onPress={() => removeIngredient(index)} type="button">❌</Button>
                            </div>
                        ))}
                        <datalist id="ingredient-options">
                            {existingIngredients.map((ing, index) => (
                                <SelectItem key={index} value={ing.name} />
                            ))}
                        </datalist>
                        <Button onPress={addIngredient} type="button">Ajouter un ingrédient</Button>
                    </CardBody>
                </Card>
            </div>

            <div className="col-span-12 flex justify-end">
                <Button type="submit">Créer la recette</Button>
            </div>
        </form>
    );
}
