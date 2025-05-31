// types/tag.ts
export interface TagData {
    id?: string;
    name: string;
    slug: string;
    color: string;
    category: TagCategory;
    created_at?: string;
    updated_at?: string;
}

// Ajout du type TagCategory manquant
export type TagCategory =
    | "cuisine"
    | "regime"
    | "difficulte"
    | "temps"
    | "occasion";

// Interface pour la création d'un tag
export interface CreateTagInput {
    name: string;
    slug: string;
    color: string;
    category: TagCategory;
}