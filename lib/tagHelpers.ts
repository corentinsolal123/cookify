// lib/tagHelpers.ts - UTILITAIRES
import { TagData } from "@/types/tag";

export const TAG_COLORS = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
} as const;

export const TAG_CATEGORIES = {
    cuisine: { label: "Cuisine", icon: "🌍" },
    regime: { label: "Régime", icon: "🥗" },
    difficulte: { label: "Difficulté", icon: "⭐" },
    temps: { label: "Temps", icon: "⏱️" },
    occasion: { label: "Occasion", icon: "🎉" }
} as const;

/**
 * Generate slug from name
 */
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .trim();
};

/**
 * Get predefined tags for seeding
 */
export const PREDEFINED_TAGS: Omit<TagData, "_id" | "createdAt" | "updatedAt">[] = [
    // Cuisine
    { name: "Italien", slug: "italien", color: "green", category: "cuisine" },
    { name: "Français", slug: "francais", color: "blue", category: "cuisine" },
    { name: "Asiatique", slug: "asiatique", color: "red", category: "cuisine" },
    { name: "Méditerranéen", slug: "mediterraneen", color: "orange", category: "cuisine" },

    // Régime
    { name: "Végétarien", slug: "vegetarien", color: "green", category: "regime" },
    { name: "Végan", slug: "vegan", color: "green", category: "regime" },
    { name: "Sans gluten", slug: "sans-gluten", color: "yellow", category: "regime" },
    { name: "Faible en calories", slug: "faible-calories", color: "blue", category: "regime" },

    // Temps
    { name: "Rapide (< 30min)", slug: "rapide", color: "red", category: "temps" },
    { name: "Express (< 15min)", slug: "express", color: "red", category: "temps" },

    // Occasion
    { name: "Apéritif", slug: "aperitif", color: "purple", category: "occasion" },
    { name: "Dessert", slug: "dessert", color: "pink", category: "occasion" },
    { name: "Petit-déjeuner", slug: "petit-dejeuner", color: "yellow", category: "occasion" },
    { name: "Plat principal", slug: "plat-principal", color: "orange", category: "occasion" }
];