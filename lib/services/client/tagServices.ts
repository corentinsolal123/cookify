// lib/services/client/tagServices.ts
import { supabase } from "@/lib/supabase/client";
import { CreateTagInput, TagCategory, TagData } from "@/types/tag";

/**
 * Récupérer tous les tags existants
 */
export async function getAllTags(): Promise<TagData[]> {
    try {
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            console.error("Erreur récupération tags:", error);
            throw new Error("Impossible de récupérer les tags");
        }

        return data as TagData[];

    } catch (error) {
        console.error("Erreur dans getAllTags:", error);
        throw error;
    }
}

/**
 * Récupérer les tags par catégorie
 */
export async function getTagsByCategory(category: TagCategory): Promise<TagData[]> {
    try {
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .eq("category", category)
            .order("name", { ascending: true });

        if (error) {
            console.error("Erreur récupération tags par catégorie:", error);
            throw new Error("Impossible de récupérer les tags");
        }

        return data as TagData[];

    } catch (error) {
        console.error("Erreur dans getTagsByCategory:", error);
        throw error;
    }
}

/**
 * Rechercher des tags par nom
 */
export async function searchTags(query: string): Promise<TagData[]> {
    try {
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .ilike("name", `%${query}%`)
            .order("name", { ascending: true })
            .limit(20);

        if (error) {
            console.error("Erreur recherche tags:", error);
            throw new Error("Impossible de rechercher les tags");
        }

        return data as TagData[];

    } catch (error) {
        console.error("Erreur dans searchTags:", error);
        throw error;
    }
}

/**
 * Créer un nouveau tag
 */
export async function createTag(tagInput: CreateTagInput): Promise<TagData> {
    try {
        // Vérifier que le tag n'existe pas déjà
        const { data: existing } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tagInput.name)
            .single();

        if (existing) {
            throw new Error(`Le tag "${tagInput.name}" existe déjà`);
        }

        // Créer le nouveau tag
        const { data, error } = await supabase
            .from("tags")
            .insert([{
                name: tagInput.name.toLowerCase().trim(),
                slug: tagInput.slug.toLowerCase().trim(),
                color: tagInput.color,
                category: tagInput.category,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error("Erreur création tag:", error);

            // Gestion des erreurs spécifiques
            if (error.code === "23505") { // Violation de contrainte unique
                throw new Error(`Le tag "${tagInput.name}" existe déjà`);
            }

            throw new Error("Impossible de créer le tag");
        }

        return data as TagData;

    } catch (error) {
        console.error("Erreur dans createTag:", error);
        throw error;
    }
}

/**
 * Vérifier si un tag existe
 */
export async function tagExists(name: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from("tags")
            .select("id")
            .eq("name", name.toLowerCase().trim())
            .single();

        if (error && error.code !== "PGRST116") {
            throw new Error("Erreur lors de la vérification du tag");
        }

        return !!data;

    } catch (error) {
        console.error("Erreur dans tagExists:", error);
        return false;
    }
}

/**
 * Récupérer les tags les plus utilisés
 */
export async function getPopularTags(limit: number = 10): Promise<TagData[]> {
    try {
        // Cette requête nécessiterait un index sur les tags dans la table recipes
        // Pour l'instant, on retourne juste les premiers tags
        const { data, error } = await supabase
            .from("tags")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Erreur récupération tags populaires:", error);
            throw new Error("Impossible de récupérer les tags populaires");
        }

        return data as TagData[];

    } catch (error) {
        console.error("Erreur dans getPopularTags:", error);
        throw error;
    }
}

/**
 * Mettre à jour un tag existant
 */
export async function updateTag(id: string, updates: Partial<CreateTagInput>): Promise<TagData> {
    try {
        const { data, error } = await supabase
            .from("tags")
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Erreur mise à jour tag:", error);
            throw new Error("Impossible de mettre à jour le tag");
        }

        return data as TagData;

    } catch (error) {
        console.error("Erreur dans updateTag:", error);
        throw error;
    }
}

/**
 * Supprimer un tag
 */
export async function deleteTag(id: string): Promise<void> {
    try {
        const { error } = await supabase
            .from("tags")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erreur suppression tag:", error);
            throw new Error("Impossible de supprimer le tag");
        }

    } catch (error) {
        console.error("Erreur dans deleteTag:", error);
        throw error;
    }
}