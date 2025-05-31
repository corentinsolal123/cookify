// components/recipes/RecipeEditForm.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save, X } from "lucide-react";
import { RecipeData, CreateRecipeInput, UpdateRecipeInput } from "@/types/recipe";
import { IngredientData } from "@/types/ingredient";
import { createRecipe, updateRecipe } from "@/lib/services/client/recipeServices";
import RecipeBasicInfo from "@/components/recipes/form/RecipeBasicInfo";
import RecipeIngredientsEditor from "@/components/recipes/form/RecipeIngredientsEditor";
import RecipeStepsEditor from "@/components/recipes/form/RecipeStepsEditor";
import RecipeImageUpload from "@/components/recipes/form/RecipeImageUpload";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

interface RecipeEditFormProps {
    initialData: RecipeData | null;
    isCreating: boolean;
    recipeId?: string;
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
            prep_time: 1,           // ✅ Doit être > 0 selon contrainte DB
            cook_time: 0,           // ✅ Peut être 0 selon contrainte DB
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

    // États
    const [formData, setFormData] = useState<FormState>(getInitialFormState(initialData));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Utilisation de useTransition pour une meilleure UX (nouveau hook Next.js)
    const [isPending, startTransition] = useTransition();
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // Fonction pour mettre à jour les données du formulaire
    const updateFormData = (updates: Partial<FormState>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
        setSaveStatus("idle");

        // Clear les erreurs relatives aux champs modifiés
        const updatedFields = Object.keys(updates);
        setErrors(prev => {
            const newErrors = { ...prev };
            updatedFields.forEach(field => delete newErrors[field]);
            return newErrors;
        });
    };

    // Validation du formulaire côté client
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validation des champs requis
        if (!formData.name.trim()) {
            newErrors.name = "Le nom de la recette est requis";
        } else if (formData.name.length > 100) {
            newErrors.name = "Le nom ne peut pas dépasser 100 caractères";
        }

        if (!formData.creator.trim()) {
            newErrors.creator = "Le nom du créateur est requis";
        } else if (formData.creator.length > 50) {
            newErrors.creator = "Le nom du créateur ne peut pas dépasser 50 caractères";
        }

        if (formData.description.length > 500) {
            newErrors.description = "La description ne peut pas dépasser 500 caractères";
        }

        // Validation des temps (conforme aux contraintes DB)
        if (formData.prep_time <= 0) {
            newErrors.prep_time = "Le temps de préparation doit être supérieur à 0";
        } else if (formData.prep_time > 999) {
            newErrors.prep_time = "Le temps de préparation ne peut pas dépasser 999 minutes";
        }

        if (formData.cook_time < 0) {
            newErrors.cook_time = "Le temps de cuisson ne peut pas être négatif";
        } else if (formData.cook_time > 999) {
            newErrors.cook_time = "Le temps de cuisson ne peut pas dépasser 999 minutes";
        }

        // Au moins un temps doit être défini
        if (formData.prep_time <= 0 && formData.cook_time <= 0) {
            newErrors.time = "Au moins un temps (préparation ou cuisson) doit être défini";
        }

        // Validation des portions
        if (formData.servings <= 0) {
            newErrors.servings = "Le nombre de portions doit être supérieur à 0";
        } else if (formData.servings > 50) {
            newErrors.servings = "Le nombre de portions ne peut pas dépasser 50";
        }

        // Validation des ingrédients
        if (formData.ingredients.length === 0) {
            newErrors.ingredients = "Au moins un ingrédient est requis";
        } else {
            // Vérifier que tous les ingrédients ont un nom et une quantité
            const invalidIngredients = formData.ingredients.filter(
                ingredient => !ingredient.name.trim() || ingredient.quantityPerServing <= 0
            );
            if (invalidIngredients.length > 0) {
                newErrors.ingredients = "Tous les ingrédients doivent avoir un nom et une quantité valide";
            }
        }

        // Validation des étapes
        const validSteps = formData.steps.filter(step => step.trim());
        if (validSteps.length === 0) {
            newErrors.steps = "Au moins une étape de préparation est requise";
        }

        // Validation des tags
        if (formData.tags.length > 8) {
            newErrors.tags = "Maximum 8 tags autorisés";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fonction de sauvegarde avec useTransition
    const handleSave = () => {
        if (!validateForm()) {
            return;
        }

        setSaveStatus("saving");

        startTransition(async () => {
            try {
                // Préparation des données pour le service
                const recipeInput: CreateRecipeInput | UpdateRecipeInput = {
                    ...formData,
                    steps: formData.steps.filter(step => step.trim() !== ""), // Enlever les étapes vides
                };

                let savedRecipe: RecipeData;

                if (isCreating) {
                    // Création d'une nouvelle recette
                    savedRecipe = await createRecipe(recipeInput as CreateRecipeInput);
                } else {
                    // Mise à jour d'une recette existante
                    if (!recipeId) {
                        throw new Error("ID de recette manquant pour la mise à jour");
                    }
                    savedRecipe = await updateRecipe({
                        id: recipeId,
                        ...recipeInput
                    } as UpdateRecipeInput);
                }

                // Succès !
                setSaveStatus("saved");
                setHasUnsavedChanges(false);

                // Redirection après création avec un délai pour montrer le succès
                if (isCreating) {
                    setTimeout(() => {
                        router.push(`/recipes/${savedRecipe.id}`);
                    }, 1500);
                }

            } catch (error) {
                console.error("Erreur lors de la sauvegarde:", error);
                setSaveStatus("error");

                // Afficher l'erreur spécifique si possible
                const errorMessage = error instanceof Error
                    ? error.message
                    : "Erreur lors de la sauvegarde. Veuillez réessayer.";

                setErrors({ general: errorMessage });
            }
        });
    };

    // Fonction d'annulation avec confirmation
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                "Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?"
            );
            if (!confirmed) return;
        }

        if (isCreating) {
            router.push("/recipes");
        } else if (recipeId) {
            router.push(`/recipes/${recipeId}`);
        } else {
            router.push("/recipes");
        }
    };

    // Protection contre la fermeture accidentelle
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "Vous avez des modifications non sauvegardées.";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Auto-save draft (fonctionnalité bonus)
    useEffect(() => {
        if (hasUnsavedChanges && isCreating) {
            const timeoutId = setTimeout(() => {
                // Sauvegarder en localStorage comme brouillon
                localStorage.setItem('recipe-draft', JSON.stringify(formData));
            }, 2000);

            return () => clearTimeout(timeoutId);
        }
    }, [formData, hasUnsavedChanges, isCreating]);

    return (
        <div className="space-y-8">
            {/* Barre d'actions sticky avec indicateurs de statut */}
            <Card className="sticky top-4 z-40 shadow-lg">
                <CardBody className="p-4">
                    <div className="flex items-center justify-between">

                        {/* Statut de sauvegarde avec chips colorés */}
                        <div className="flex items-center gap-3">
                            {saveStatus === "saving" && (
                                <Chip
                                    color="primary"
                                    variant="flat"
                                    startContent={
                                        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    }
                                >
                                    Sauvegarde en cours...
                                </Chip>
                            )}

                            {saveStatus === "saved" && (
                                <Chip
                                    color="success"
                                    variant="flat"
                                    startContent={<CheckCircle2 className="w-3 h-3" />}
                                >
                                    Sauvegardé !
                                </Chip>
                            )}

                            {saveStatus === "error" && (
                                <Chip
                                    color="danger"
                                    variant="flat"
                                    startContent={<AlertCircle className="w-3 h-3" />}
                                >
                                    Erreur de sauvegarde
                                </Chip>
                            )}

                            {hasUnsavedChanges && saveStatus === "idle" && (
                                <Chip color="warning" variant="flat">
                                    Modifications non sauvegardées
                                </Chip>
                            )}
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-3">
                            <Button
                                onPress={handleCancel}
                                color="default"
                                variant="bordered"
                                startContent={<X className="w-4 h-4" />}
                                isDisabled={isPending}
                            >
                                Annuler
                            </Button>

                            <Button
                                onPress={handleSave}
                                color="primary"
                                isLoading={isPending}
                                startContent={!isPending && <Save className="w-4 h-4" />}
                            >
                                {isPending
                                    ? "Sauvegarde..."
                                    : isCreating
                                        ? "Créer la recette"
                                        : "Sauvegarder"
                                }
                            </Button>
                        </div>
                    </div>

                    {/* Erreurs générales */}
                    {errors.general && (
                        <div className="mt-4">
                            <Chip color="danger" variant="bordered" className="w-full justify-start">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {errors.general}
                            </Chip>
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

                    {/* Résumé de la recette amélioré */}
                    <Card>
                        <CardBody className="p-6">
                            <h3 className="font-semibold mb-4 text-lg">Résumé</h3>
                            <div className="space-y-3">

                                <div className="flex justify-between items-center">
                                    <span className="text-default-600">Ingrédients:</span>
                                    <Chip size="sm" color="success" variant="flat">
                                        {formData.ingredients.length}
                                    </Chip>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-default-600">Étapes:</span>
                                    <Chip size="sm" color="primary" variant="flat">
                                        {formData.steps.filter(step => step.trim()).length}
                                    </Chip>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-default-600">Temps total:</span>
                                    <Chip size="sm" color="secondary" variant="flat">
                                        {formData.prep_time + formData.cook_time} min
                                    </Chip>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-default-600">Portions:</span>
                                    <Chip size="sm" color="warning" variant="flat">
                                        {formData.servings}
                                    </Chip>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-default-600">Tags:</span>
                                    <Chip size="sm" color="default" variant="flat">
                                        {formData.tags.length}/8
                                    </Chip>
                                </div>

                            </div>
                        </CardBody>
                    </Card>

                    {/* Indicateur de progression */}
                    <Card>
                        <CardBody className="p-6">
                            <h3 className="font-semibold mb-4">Progression</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Informations de base", completed: !!(formData.name && formData.creator) },
                                    { label: "Ingrédients", completed: formData.ingredients.length > 0 },
                                    { label: "Étapes", completed: formData.steps.some(step => step.trim()) },
                                    { label: "Photo", completed: !!formData.image },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${item.completed ? 'bg-success' : 'bg-default-300'}`} />
                                        <span className={`text-sm ${item.completed ? 'text-success' : 'text-default-500'}`}>
                      {item.label}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}