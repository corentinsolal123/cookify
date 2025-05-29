// lib/services/recipeServices.ts - CLIENT ONLY
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RecipeData } from "@/types/recipe";
import { SearchFilters } from "@/types/search";

export interface RecipesResult {
    recipes: RecipeData[]
    total: number
    page: number
    totalPages: number
}

// Client pour les composants client
const getSupabaseClient = () => createClientComponentClient()

// Recherche avec filtres (client)
export async function searchRecipes(filters: SearchFilters = {}): Promise<RecipesResult> {
    const supabase = getSupabaseClient()

    let query = supabase
        .from('recipes')
        .select(`
      id,
      name,
      description,
      difficulty,
      prep_time,
      cook_time,
      calories,
      creator,
      servings,
      steps,
      ingredients,
      tags,
      image,
      created_at,
      updated_at
    `, { count: 'exact' })

    // Filtres de recherche
    if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
    }

    if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
    }

    if (filters.maxPrepTime) {
        query = query.lte('prep_time', filters.maxPrepTime)
    }

    if (filters.maxCookTime) {
        query = query.lte('cook_time', filters.maxCookTime)
    }

    // Pagination
    const limit = filters.limit || 12
    const page = filters.page || 1
    const offset = (page - 1) * limit

    query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Mapper vers tes types
    const recipes: RecipeData[] = (data || []).map(mapRecipeFromSupabase)

    return {
        recipes,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    }
}

// Récupérer une recette par ID (client)
export async function getRecipeById(id: string): Promise<RecipeData | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null // Pas trouvé
        throw error
    }

    return mapRecipeFromSupabase(data)
}

// Créer une recette (client)
export async function createRecipe(recipe: Omit<RecipeData, 'id'>): Promise<RecipeData> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('recipes')
        .insert([{
            name: recipe.name,
            description: recipe.description,
            difficulty: recipe.difficulty,
            prep_time: recipe.prep_time,
            cook_time: recipe.cook_time,
            calories: recipe.calories,
            creator: recipe.creator,
            servings: recipe.servings,
            steps: recipe.steps,
            ingredients: recipe.ingredients,
            tags: recipe.tags || [],
            image: recipe.image
        }])
        .select()
        .single()

    if (error) throw error

    return mapRecipeFromSupabase(data)
}

// Mettre à jour une recette (client)
export async function updateRecipe(id: string, updates: Partial<RecipeData>): Promise<RecipeData> {
    const supabase = getSupabaseClient()

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty
    if (updates.prep_time !== undefined) updateData.prep_time = updates.prep_time
    if (updates.cook_time !== undefined) updateData.cook_time = updates.cook_time
    if (updates.calories !== undefined) updateData.calories = updates.calories
    if (updates.creator !== undefined) updateData.creator = updates.creator
    if (updates.servings !== undefined) updateData.servings = updates.servings
    if (updates.steps !== undefined) updateData.steps = updates.steps
    if (updates.ingredients !== undefined) updateData.ingredients = updates.ingredients
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.image !== undefined) updateData.image = updates.image

    const { data, error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    return mapRecipeFromSupabase(data)
}

// Supprimer une recette (client)
export async function deleteRecipe(id: string): Promise<void> {
    const supabase = getSupabaseClient()

    const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Récupérer les recettes de l'utilisateur connecté (client)
export async function getUserRecipes(): Promise<RecipeData[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapRecipeFromSupabase)
}

// Helper pour mapper les données Supabase vers tes types
function mapRecipeFromSupabase(data: any): RecipeData {
    return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        difficulty: data.difficulty,
        prep_time: data.prep_time,
        cook_time: data.cook_time,
        calories: data.calories || 0,
        creator: data.creator,
        servings: data.servings,
        steps: data.steps || [],
        ingredients: data.ingredients || [],
        tags: data.tags || [],
        image: data.image
    }
}