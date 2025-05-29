// components/recipes/edit/RecipeBasicInfo.tsx
"use client";

import { ChefHat } from "lucide-react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import TagsInput from "@/components/ui/TagsInput";

interface RecipeBasicInfoProps {
    data: {
        name: string;
        description: string;
        difficulty: "facile" | "moyen" | "difficile";
        prep_time: number;
        cook_time: number;
        servings: number;
        creator: string;
        tags: string[];
    };
    errors: Record<string, string>;
    onChange: (updates: any) => void;
}

export default function RecipeBasicInfo({
                                            data,
                                            errors,
                                            onChange
                                        }: Readonly<RecipeBasicInfoProps>) {

    // Fonction pour ajouter/supprimer des tags
    const handleTagChange = (tagValue: string) => {
        const tags = tagValue
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        onChange({ tags });
    };

    // Options de difficulté avec couleurs
    const difficultyOptions = [
        { value: "facile", label: "Facile", color: "bg-green-100 text-green-800" },
        { value: "moyen", label: "Moyen", color: "bg-yellow-100 text-yellow-800" },
        { value: "difficile", label: "Difficile", color: "bg-red-100 text-red-800" }
    ];

    return (
        <Card className={"w-full p-2"}>
            <CardHeader>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    Informations générales
                </h2>
            </CardHeader>
            <Divider className="w-5/6 mx-auto my-6" />
            <CardBody>
                <div className="space-y-6">

                    {/* Nom de la recette */}
                    <div>
                        <Input
                            type="text"
                            value={data.name}
                            label="Nom de la recette"
                            maxLength={100}
                            onChange={(e) => onChange({ name: e.target.value })}
                            isRequired
                            isClearable
                            isInvalid={!!errors.name}
                            errorMessage={errors.name}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {data.name.length}/100 caractères
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <Textarea
                            label={"Description"}
                            value={data.description}
                            onChange={(e) => onChange({ description: e.target.value })}
                            rows={3}
                            placeholder="Décris ta recette en quelques mots..."
                            maxLength={500}
                            isClearable
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {data.description.length}/500 caractères
                        </p>
                    </div>

                    {/* Créateur */}
                    <div>
                        <Input
                            type="text"
                            value={data.creator}
                            label="Créateur"
                            placeholder="Ton nom ou pseudonyme"
                            maxLength={50}
                            onChange={(e) => onChange({ creator: e.target.value })}
                            isRequired
                            isInvalid={!!errors.creator}
                            errorMessage={errors.creator}
                        />
                    </div>

                    {/* Difficulté */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Niveau de difficulté
                        </label>
                        <div className="flex gap-3">
                            {difficultyOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    onPress={() => onChange({ difficulty: option.value })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        data.difficulty === option.value
                                            ? option.color
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-500 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Temps et portions - Grid responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {/* Temps de préparation */}
                        <div>
                            <Input
                                type="number"
                                label="Préparation (min)"
                                id="prep_time"
                                value={data.prep_time.toString() || ""}
                                onChange={(e) => onChange({ prep_time: parseInt(e.target.value) || 0 })}
                                min="0"
                                max="999"
                                placeholder="0"
                                isInvalid={!!errors.prep_time}
                                errorMessage={errors.prep_time}
                            />
                        </div>

                        {/* Temps de cuisson */}
                        <div>

                            <Input
                                label="Cuisson (min)"
                                type="number"
                                id="cook_time"
                                value={data.cook_time.toString() || ""}
                                onChange={(e) => onChange({ cook_time: parseInt(e.target.value) || 0 })}
                                min="0"
                                max="999"
                                placeholder="0"
                                isInvalid={!!errors.cook_time}
                                errorMessage={errors.cook_time}
                            />
                        </div>

                        {/* Nombre de portions */}
                        <div>
                            <Input
                                label="Portions"
                                type="number"
                                id="servings"
                                value={data.servings.toString() || ""}
                                onChange={(e) => onChange({ servings: parseInt(e.target.value) || 1 })}
                                min="1"
                                max="50"
                                placeholder="4"
                                isInvalid={!!errors.servings}
                                errorMessage={errors.servings}
                            />
                        </div>
                    </div>

                    {/* Erreur pour les temps */}
                    {errors.time && (
                        <p className="text-sm text-red-600">{errors.time}</p>
                    )}

                    {/* Tags */}
                    <TagsInput
                        value={data.tags}
                        onChange={(tags) => onChange({ tags })}
                        label="Tags de la recette"
                        placeholder="Ajouter un tag..."
                        description="Appuie sur Entrée pour ajouter un tag (ex: dessert, facile, pommes)"
                        maxTags={8}
                    />
                </div>
            </CardBody>
            <Divider className="w-5/6 mx-auto my-6" />
            <CardFooter>
                {/* Résumé rapide */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Temps total:</span>
                    <span className="font-medium">{(data.prep_time || 0) + (data.cook_time || 0)} minutes</span>
                </div>
            </CardFooter>
        </Card>
    );
}