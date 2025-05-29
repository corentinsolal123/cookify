// lib/services/tagServicesServer.ts - SERVER ONLY
import { TagData } from "@/types/tag";
import { createClient } from "@/lib/supabase/server";

// Pour les composants server
export async function getAllTagsServer(): Promise<TagData[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("category, name");

    if (error) {
        console.error("Erreur getAllTagsServer:", error);
        throw error;
    }

    return (data || []).map(mapTagFromSupabase);
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