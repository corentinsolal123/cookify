// lib/services/client/recipeServices.ts
import { supabase } from "@/lib/supabase/client";
import { CreateRecipeInput, RecipeData, UpdateRecipeInput } from "@/types/recipe";

/**
 * Calculer les calories totales d'une recette depuis ses ingrédients
 */
function calculateTotalCalories(ingredients: any[], servings: number): number {
    const totalCalories = ingredients.reduce((total, ingredient) => {
        return total + (ingredient.calories * (ingredient.quantityPerServing / 100));
    }, 0);

    return Math.round(totalCalories * servings);
}

/**
 * Récupérer l'utilisateur connecté
 */
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Utilisateur non connecté");
    }

    return user;
}

/**
 * Créer une nouvelle recette (conforme au schéma)
 */
export async function createRecipe(recipeData: CreateRecipeInput): Promise<RecipeData> {
    try {
        // 1. Validation côté client
        validateRecipeData(recipeData);

        // 2. Récupérer l'utilisateur connecté
        const user = await getCurrentUser();

        // 3. Calculer les calories totales
        const totalCalories = calculateTotalCalories(recipeData.ingredients, recipeData.servings);

        // 4. Préparer les données pour Supabase (conforme au schéma)
        const recipeToInsert = {
            user_id: user.id,                                           // ✅ user_id requis
            name: recipeData.name,
            description: recipeData.description || null,
            difficulty: recipeData.difficulty,
            prep_time: recipeData.prep_time,                           // doit être > 0
            cook_time: recipeData.cook_time,                           // peut être 0
            calories: totalCalories,                                   // ✅ calculé automatiquement
            creator: recipeData.creator,
            steps: recipeData.steps.filter(step => step.trim()),      // ✅ ARRAY
            servings: recipeData.servings,
            ingredients: recipeData.ingredients,                       // ✅ JSONB
            tags: recipeData.tags,                                     // ✅ ARRAY
            image: recipeData.image || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // 5. Insérer en base
        const { data, error } = await supabase
            .from("recipes")
            .insert([recipeToInsert])
            .select()
            .single();

        if (error) {
            console.error("Erreur Supabase:", error);
            throw new Error("Impossible de créer la recette");
        }

        return data as RecipeData;

    } catch (error) {
        console.error("Erreur dans createRecipe:", error);
        throw error;
    }
}

/**
 * Mettre à jour une recette existante
 */
export async function updateRecipe(recipeData: UpdateRecipeInput): Promise<RecipeData> {
    try {
        const { id, ...updateData } = recipeData;

        if (!id) {
            throw new Error("ID de la recette requis pour la mise à jour");
        }

        // 1. Vérifier que l'utilisateur est le propriétaire
        const user = await getCurrentUser();

        const { data: existingRecipe } = await supabase
            .from("recipes")
            .select("user_id")
            .eq("id", id)
            .single();

        if (!existingRecipe || existingRecipe.user_id !== user.id) {
            throw new Error("Vous n'êtes pas autorisé à modifier cette recette");
        }

        // 2. Calculer les nouvelles calories si les ingrédients ont changé
        let calculatedCalories: number | undefined;
        if (updateData.ingredients && updateData.servings) {
            calculatedCalories = calculateTotalCalories(updateData.ingredients, updateData.servings);
        } else if (updateData.ingredients || updateData.servings) {
            // Si seulement l'un des deux change, récupérer l'autre depuis la base
            const { data: current } = await supabase
                .from("recipes")
                .select("ingredients, servings")
                .eq("id", id)
                .single();

            if (current) {
                const ingredients = updateData.ingredients || current.ingredients;
                const servings = updateData.servings || current.servings;
                calculatedCalories = calculateTotalCalories(ingredients, servings);
            }
        }

        // 3. Préparer les données à mettre à jour
        const recipeToUpdate = {
            ...updateData,
            steps: updateData.steps?.filter(step => step.trim()),
            calories: calculatedCalories,                              // ✅ Recalculé si nécessaire
            updated_at: new Date().toISOString()
        };

        // 4. Mettre à jour en base
        const { data, error } = await supabase
            .from("recipes")
            .update(recipeToUpdate)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erreur Supabase:", error);
            throw new Error("Impossible de mettre à jour la recette");
        }

        return data as RecipeData;

    } catch (error) {
        console.error("Erreur dans updateRecipe:", error);
        throw error;
    }
}

/**
 * Récupérer une recette par ID
 */
export async function getRecipeById(id: string): Promise<RecipeData | null> {
    try {
        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null; // Recette non trouvée
            }
            throw new Error("Erreur lors de la récupération de la recette");
        }

        return data as RecipeData;

    } catch (error) {
        console.error("Erreur dans getRecipeById:", error);
        throw error;
    }
}

/**
 * Récupérer les recettes de l'utilisateur connecté
 */
export async function getUserRecipes(): Promise<RecipeData[]> {
    try {
        const user = await getCurrentUser();

        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error("Erreur lors de la récupération des recettes");
        }

        return data as RecipeData[];

    } catch (error) {
        console.error("Erreur dans getUserRecipes:", error);
        throw error;
    }
}

/**
 * Récupérer toutes les recettes publiques (avec pagination)
 */
export async function getPublicRecipes(page: number = 1, limit: number = 20): Promise<{
    recipes: RecipeData[];
    total: number;
    hasMore: boolean;
}> {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Compter le total
        const { count } = await supabase
            .from("recipes")
            .select("*", { count: "exact", head: true });

        // Récupérer les recettes paginées
        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            throw new Error("Erreur lors de la récupération des recettes");
        }

        return {
            recipes: data as RecipeData[],
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };

    } catch (error) {
        console.error("Erreur dans getPublicRecipes:", error);
        throw error;
    }
}

/**
 * Rechercher des recettes par tags (utilise l'ARRAY)
 */
export async function searchRecipesByTags(tags: string[]): Promise<RecipeData[]> {
    try {
        const { data, error } = await supabase
            .from("recipes")
            .select("*")
            .overlaps("tags", tags);

        if (error) {
            throw new Error("Erreur lors de la recherche par tags");
        }

        return data as RecipeData[];

    } catch (error) {
        console.error("Erreur dans searchRecipesByTags:", error);
        throw error;
    }
}

/**
 * Supprimer une recette (avec vérification propriétaire)
 */
export async function deleteRecipe(id: string): Promise<void> {
    try {
        const user = await getCurrentUser();

        // Vérifier que l'utilisateur est le propriétaire
        const { data: recipe } = await supabase
            .from("recipes")
            .select("user_id")
            .eq("id", id)
            .single();

        if (!recipe || recipe.user_id !== user.id) {
            throw new Error("Vous n'êtes pas autorisé à supprimer cette recette");
        }

        const { error } = await supabase
            .from("recipes")
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error("Impossible de supprimer la recette");
        }

    } catch (error) {
        console.error("Erreur dans deleteRecipe:", error);
        throw error;
    }
}

/**
 * Validation des données de recette (conforme aux contraintes)
 */
function validateRecipeData(recipeData: CreateRecipeInput): void {
    if (!recipeData.name.trim()) {
        throw new Error("Le nom de la recette est requis");
    }

    if (!recipeData.creator.trim()) {
        throw new Error("Le créateur est requis");
    }

    // ✅ prep_time doit être > 0 (contrainte base)
    if (recipeData.prep_time <= 0) {
        throw new Error("Le temps de préparation doit être supérieur à 0");
    }

    // ✅ cook_time peut être 0 (contrainte base >= 0)
    if (recipeData.cook_time < 0) {
        throw new Error("Le temps de cuisson ne peut pas être négatif");
    }

    if (recipeData.servings <= 0) {
        throw new Error("Le nombre de portions doit être supérieur à 0");
    }

    if (recipeData.ingredients.length === 0) {
        throw new Error("Au moins un ingrédient est requis");
    }

    if (recipeData.steps.filter(step => step.trim()).length === 0) {
        throw new Error("Au moins une étape est requise");
    }

    // Valider chaque ingrédient
    recipeData.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name.trim()) {
            throw new Error(`L'ingrédient ${index + 1} doit avoir un nom`);
        }
        if (ingredient.quantityPerServing <= 0) {
            throw new Error(`L'ingrédient ${index + 1} doit avoir une quantité supérieure à 0`);
        }
        if (ingredient.calories < 0) {
            throw new Error(`L'ingrédient ${index + 1} ne peut pas avoir de calories négatives`);
        }
        if (ingredient.proteins < 0 || ingredient.carbs < 0 || ingredient.fat < 0 || ingredient.fiber < 0) {
            throw new Error(`L'ingrédient ${index + 1} ne peut pas avoir de valeurs nutritionnelles négatives`);
        }
    });
}