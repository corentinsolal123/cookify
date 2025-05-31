// lib/services/shoppingListService.ts
import { ShoppingListData, ShoppingListItemData } from "@/types/shoppingList";
import { supabase } from "@/lib/supabase/client";

export class ShoppingListService {
    // Récupérer toutes les listes de l'utilisateur
    static async getUserShoppingLists(): Promise<ShoppingListData[]> {
        const { data: user } = await supabase.auth.getUser();

        if (!user.user) throw new Error("Utilisateur non connecté");

        const { data, error } = await supabase
            .from("shopping_lists")
            .select(`
        *,
        items:shopping_list_items(*)
      `)
            .eq("user_id", user.user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Créer une nouvelle liste
    static async createShoppingList(name: string): Promise<ShoppingListData> {
        const { data: user } = await supabase.auth.getUser();

        if (!user.user) throw new Error("Utilisateur non connecté");

        const { data, error } = await supabase
            .from("shopping_lists")
            .insert([{
                name,
                user_id: user.user.id,
                recipes: []
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Ajouter une recette à une liste
    static async addRecipeToList(listId: string, recipeId: string): Promise<void> {
        // D'abord récupérer la liste actuelle
        const { data: list, error: listError } = await supabase
            .from("shopping_lists")
            .select("recipes")
            .eq("id", listId)
            .single();

        if (listError) throw listError;

        // Ajouter la recette si elle n'y est pas déjà
        const recipes = list.recipes || [];
        if (!recipes.includes(recipeId)) {
            recipes.push(recipeId);

            const { error } = await supabase
                .from("shopping_lists")
                .update({ recipes })
                .eq("id", listId);

            if (error) throw error;
        }
    }

    // Ajouter un item à une liste
    static async addItemToList(listId: string, item: Omit<ShoppingListItemData, "id" | "created_at" | "updated_at" | "shopping_list_id">): Promise<ShoppingListItemData> {
        const { data, error } = await supabase
            .from("shopping_list_items")
            .insert([{
                ...item,
                shopping_list_id: listId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Mettre à jour un item
    static async updateItem(itemId: string, updates: Partial<ShoppingListItemData>): Promise<ShoppingListItemData> {
        const { data, error } = await supabase
            .from("shopping_list_items")
            .update(updates)
            .eq("id", itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Supprimer un item
    static async deleteItem(itemId: string): Promise<void> {
        const { error } = await supabase
            .from("shopping_list_items")
            .delete()
            .eq("id", itemId);

        if (error) throw error;
    }
}