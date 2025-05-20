import { RecipeData } from "@/types/recipe";

// Base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * Fetch all recipes
 */
export const getAllRecipes = async (): Promise<RecipeData[]> => {
  const res = await fetch(`${API_BASE_URL}/api/recipes`, { 
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch recipes');
  }
  
  return res.json();
};

/**
 * Fetch a specific recipe by ID
 */
export const getRecipeById = async (id: string): Promise<RecipeData> => {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, { 
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch recipe with ID: ${id}`);
  }
  
  return res.json();
};

/**
 * Create a new recipe
 */
export const createRecipe = async (recipeData: Partial<RecipeData>): Promise<RecipeData> => {
  const res = await fetch(`${API_BASE_URL}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData)
  });
  
  if (!res.ok) {
    throw new Error('Failed to create recipe');
  }
  
  return res.json();
};

/**
 * Update an existing recipe
 */
export const updateRecipe = async (id: string, recipeData: Partial<RecipeData>): Promise<RecipeData> => {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData)
  });
  
  if (!res.ok) {
    throw new Error(`Failed to update recipe with ID: ${id}`);
  }
  
  return res.json();
};

/**
 * Delete a recipe
 */
export const deleteRecipe = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) {
    throw new Error(`Failed to delete recipe with ID: ${id}`);
  }
};

/**
 * Fetch all ingredients
 */
export const getAllIngredients = async () => {
  const res = await fetch(`${API_BASE_URL}/api/ingredients`);
  
  if (!res.ok) {
    throw new Error('Failed to fetch ingredients');
  }
  
  return res.json();
};
