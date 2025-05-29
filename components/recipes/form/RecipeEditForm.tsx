// components/recipes/RecipeEditForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save, X } from "lucide-react";
import { RecipeData } from "@/types/recipe";
import { IngredientData } from "@/types/ingredient";
import RecipeBasicInfo from "@/components/recipes/form/RecipeBasicInfo";
import RecipeIngredientsEditor from "@/components/recipes/form/RecipeIngredientsEditor";
import RecipeStepsEditor from "@/components/recipes/form/RecipeStepsEditor";
import RecipeImageUpload from "@/components/recipes/form/RecipeImageUpload";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

interface RecipeEditFormProps {
    initialData: RecipeData | null;
    isCreating: boolean;
    recipeId: string;
}

// Type pour gérer l'état du formulaire
interface FormState {
    name: string;
    description: string;
    difficulty: "facile" | "moyen" | "difficile";
    prep_time: number;
    cook_time: number;
    servings: number;
    creator: string;
    ingredients: IngredientData[];
    steps: string[];
    tags: string[];
    image: string;
}

// État initial pour une nouvelle recette
const getInitialFormState = (data: RecipeData | null): FormState => {
    if (!data) {
        return {
            name: "",
            description: "",
            difficulty: "facile",
            prep_time: 0,
            cook_time: 0,
            servings: 4,
            creator: "",
            ingredients: [],
            steps: [""],
            tags: [],
            image: ""
        };
    }

    return {
        name: data.name,
        description: data.description || "",
        difficulty: data.difficulty,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        servings: data.servings,
        creator: data.creator,
        ingredients: data.ingredients,
        steps: data.steps.length > 0 ? data.steps : [""],
        tags: data.tags || [],
        image: data.image || ""
    };
};

export default function RecipeEditForm({
                                           initialData,
                                           isCreating,
                                           recipeId
                                       }: Readonly<RecipeEditFormProps>) {
    const router = useRouter();

    // État du formulaire
    const [formData, setFormData] = useState<FormState>(getInitialFormState(initialData));
    const [loading, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // Fonction pour mettre à jour les données du formulaire
    const updateFormData = (updates: Partial<FormState>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
        setSaveStatus("idle");
    };

    // Validation du formulaire
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Le nom de la recette est requis";
        }

        if (!formData.creator.trim()) {
            newErrors.creator = "Le nom du créateur est requis";
        }

        if (formData.prep_time <= 0 && formData.cook_time <= 0) {
            newErrors.time = "Au moins un temps (préparation ou cuisson) doit être supérieur à 0";
        }

        if (formData.servings <= 0) {
            newErrors.servings = "Le nombre de portions doit être supérieur à 0";
        }

        if (formData.ingredients.length === 0) {
            newErrors.ingredients = "Au moins un ingrédient est requis";
        }

        if (formData.steps.every(step => !step.trim())) {
            newErrors.steps = "Au moins une étape de préparation est requise";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fonction de sauvegarde
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setSaveStatus("saving");

        try {
            // Préparation des données pour l'API
            const recipeData: Partial<RecipeData> = {
                ...formData,
                steps: formData.steps.filter(step => step.trim() !== ""), // Enlever les étapes vides
                updated_at: new Date().toISOString()
            };

            // Si c'est une création, ajouter created_at
            if (isCreating) {
                recipeData.created_at = new Date().toISOString();
            }

            const url = isCreating
                ? "/api/recipes"
                : `/api/recipes/${recipeId}`;

            const method = isCreating ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recipeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la sauvegarde");
            }

            const savedRecipe = await response.json();

            setSaveStatus("saved");
            setHasUnsavedChanges(false);

            // Redirection après création
            if (isCreating) {
                setTimeout(() => {
                    router.push(`/recipes/${savedRecipe.id}`);
                }, 1000);
            }

        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
            setSaveStatus("error");
            setErrors({ general: "Erreur lors de la sauvegarde. Veuillez réessayer." });
        } finally {
            setSaving(false);
        }
    };

    // Fonction d'annulation
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?"
            );
            if (!confirmed) return;
        }

        if (isCreating) {
            router.push("/recipes");
        } else {
            router.push(`/recipes/${recipeId}`);
        }
    };

    // Protection contre la fermeture accidentelle
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    return (
        <div className="space-y-8">

            {/* Barre d'actions fixe */}
            <Card className="sticky top-2 z-40 p-4 -mx-4">
                <CardBody>
                    <div className="flex items-center justify-between">

                        {/* Statut de sauvegarde */}
                        <div className="flex items-center gap-2">
                            {saveStatus === "saving" && (
                                <div className="flex items-center gap-2 text-blue-600">
                                    <div
                                        className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm">Sauvegarde en cours...</span>
                                </div>
                            )}

                            {saveStatus === "saved" && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm">Sauvegardé !</span>
                                </div>
                            )}

                            {saveStatus === "error" && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">Erreur de sauvegarde</span>
                                </div>
                            )}

                            {hasUnsavedChanges && saveStatus === "idle" && (
                                <span className="text-sm text-orange-600">
                                    Modifications non sauvegardées
                                </span>
                            )}
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-3">
                            <Button
                                onPress={handleCancel}
                                color={"secondary"}
                                startContent={<X className="w-4 h-4" />}
                            >
                                Annuler
                            </Button>

                            <Button
                                onPress={handleSave}
                                disabled={loading}
                                color={"primary"}
                                startContent={<Save className="w-4 h-4" />}
                            >
                                {loading ? "Sauvegarde..." : isCreating ? "Créer" : "Sauvegarder"}
                            </Button>
                        </div>
                    </div>

                    {/* Erreurs générales */}
                    {errors.general && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{errors.general}</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Contenu du formulaire */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Colonne principale */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Informations de base */}
                    <RecipeBasicInfo
                        data={formData}
                        errors={errors}
                        onChange={updateFormData}
                    />

                    {/* Éditeur d'ingrédients */}
                    <RecipeIngredientsEditor
                        ingredients={formData.ingredients}
                        servings={formData.servings}
                        error={errors.ingredients}
                        onChange={(ingredients) => updateFormData({ ingredients })}
                    />

                    {/* Éditeur d'étapes */}
                    <RecipeStepsEditor
                        steps={formData.steps}
                        error={errors.steps}
                        onChange={(steps) => updateFormData({ steps })}
                    />
                </div>

                {/* Colonne latérale */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Upload d'image */}
                    <RecipeImageUpload
                        currentImage={formData.image}
                        recipeName={formData.name}
                        onChange={(image) => updateFormData({ image })}
                    />

                    {/* Résumé de la recette */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Résumé</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ingrédients:</span>
                                <span className="font-medium">{formData.ingredients.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Étapes:</span>
                                <span className="font-medium">
                  {formData.steps.filter(step => step.trim()).length}
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Temps total:</span>
                                <span className="font-medium">
                  {formData.prep_time + formData.cook_time} min
                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Portions:</span>
                                <span className="font-medium">{formData.servings}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}