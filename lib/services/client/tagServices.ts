// lib/services/tagServices.ts - CLIENT ONLY
import { createClient } from '@/lib/supabase/server'
import { TagData } from "@/types/tag";

// Client pour les composants client
const getSupabaseClient = () => createClient();

// Pour les composants client
export async function getAllTags(): Promise<TagData[]> {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("category, name");

    if (error) throw error;

    return (data ?? []).map(mapTagFromSupabase);
}

// Récupérer par catégorie
export async function getTagsByCategory(category: TagData["category"]): Promise<TagData[]> {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("category", category)
        .order("name");

    if (error) throw error;

    return (data ?? []).map(mapTagFromSupabase);
}

// Créer un tag
export async function createTag(tag: Omit<TagData, "id" | "createdAt" | "updatedAt">): Promise<TagData> {
    const supabase = await getSupabaseClient();

    const { data, error } = await supabase
        .from("tags")
        .insert([{
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
            category: tag.category
        }])
        .select()
        .single();

    if (error) throw error;

    return mapTagFromSupabase(data);
}

// Helper pour mapper les tags
function mapTagFromSupabase(data: any): TagData {
    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        color: data.color,
        category: data.category,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
}