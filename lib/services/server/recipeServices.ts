// lib/services/server/recipeServices.ts - SERVER ONLY
import { createClient } from '@/lib/supabase/server'
import { SearchFilters } from "@/types/search";
import { RecipeData } from "@/types/recipe";

export interface RecipesResult {
    recipes: RecipeData[]
    total: number
    page: number
    totalPages: number
}

// Pour les composants server
export async function getAllRecipes(filters: SearchFilters = {}): Promise<RecipesResult> {
    const supabase = await createClient()

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

    if (error) {
        console.error('Erreur getAllRecipes:', error)
        throw error
    }

    // Mapper vers tes types
    const recipes: RecipeData[] = (data || []).map(mapRecipeFromSupabase)

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
        recipes,
        total,
        page,
        totalPages
    }
}

// Récupérer une recette par ID (server)
export async function getRecipeByIdServer(id: string): Promise<RecipeData | null> {
    const supabase = await createClient()

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