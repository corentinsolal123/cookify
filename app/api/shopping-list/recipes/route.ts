import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ShoppingList from "@/models/ShoppingList";
import Recipe from "@/models/Recipe";
import { AddRecipeToShoppingListRequest } from "@/types/shoppingList";
import mongoose from "mongoose";

// Add a recipe to the shopping list
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        
        const userId = session.user.id;
        const data: AddRecipeToShoppingListRequest = await req.json();
        
        if (!data.recipeId) {
            return NextResponse.json(
                { error: "ID de recette requis" },
                { status: 400 }
            );
        }
        
        // Find the recipe
        const recipe = await Recipe.findById(data.recipeId).populate("ingredients");
        
        if (!recipe) {
            return NextResponse.json(
                { error: "Recette non trouvée" },
                { status: 404 }
            );
        }
        
        // Find or create the user's shopping list
        let shoppingList = await ShoppingList.findOne({ userId });
        
        if (!shoppingList) {
            shoppingList = await ShoppingList.create({
                userId,
                name: "Ma liste de courses",
                items: [],
                recipes: []
            });
        }
        
        // Check if recipe is already in the shopping list
        const recipeExists = shoppingList.recipes.some(
            (r) => r.toString() === data.recipeId
        );
        
        if (!recipeExists) {
            // Add recipe to the shopping list
            shoppingList.recipes.push(new mongoose.Types.ObjectId(data.recipeId));
        }
        
        // Calculate servings multiplier
        const servingsMultiplier = data.servings ? data.servings : 1;
        
        // Process each ingredient from the recipe
        for (const ingredient of recipe.ingredients) {
            // Calculate adjusted quantity
            const adjustedQuantity = ingredient.quantityPerServing * servingsMultiplier;
            
            // Check if ingredient already exists in the shopping list
            const existingItemIndex = shoppingList.items.findIndex(
                (item) => 
                    item.ingredient && 
                    item.ingredient.toString() === ingredient._id.toString() &&
                    item.unit === ingredient.unit
            );
            
            if (existingItemIndex >= 0) {
                // Update existing item quantity
                shoppingList.items[existingItemIndex].quantity += adjustedQuantity;
            } else {
                // Add new item to the shopping list
                shoppingList.items.push({
                    ingredient: ingredient._id,
                    name: ingredient.name,
                    quantity: adjustedQuantity,
                    unit: ingredient.unit,
                    checked: false
                });
            }
        }
        
        await shoppingList.save();
        
        return NextResponse.json({ 
            message: "Recette ajoutée à la liste de courses",
            shoppingList
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la recette à la liste de courses:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'ajout de la recette à la liste de courses" },
            { status: 500 }
        );
    }
}

// Remove a recipe from the shopping list
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        
        const userId = session.user.id;
        const { searchParams } = new URL(req.url);
        const recipeId = searchParams.get("id");
        
        if (!recipeId) {
            return NextResponse.json(
                { error: "ID de recette requis" },
                { status: 400 }
            );
        }
        
        // Find the user's shopping list
        const shoppingList = await ShoppingList.findOne({ userId });
        
        if (!shoppingList) {
            return NextResponse.json(
                { error: "Liste de courses non trouvée" },
                { status: 404 }
            );
        }
        
        // Find the recipe
        const recipe = await Recipe.findById(recipeId).populate("ingredients");
        
        if (!recipe) {
            return NextResponse.json(
                { error: "Recette non trouvée" },
                { status: 404 }
            );
        }
        
        // Remove recipe from the shopping list
        shoppingList.recipes = shoppingList.recipes.filter(
            (r) => r.toString() !== recipeId
        );
        
        // Remove or reduce quantities of ingredients from this recipe
        for (const ingredient of recipe.ingredients) {
            const existingItemIndex = shoppingList.items.findIndex(
                (item) => 
                    item.ingredient && 
                    item.ingredient.toString() === ingredient._id.toString() &&
                    item.unit === ingredient.unit
            );
            
            if (existingItemIndex >= 0) {
                // Reduce quantity (assuming 1 serving)
                shoppingList.items[existingItemIndex].quantity -= ingredient.quantityPerServing;
                
                // Remove item if quantity is zero or negative
                if (shoppingList.items[existingItemIndex].quantity <= 0) {
                    shoppingList.items.splice(existingItemIndex, 1);
                }
            }
        }
        
        await shoppingList.save();
        
        return NextResponse.json({ 
            message: "Recette retirée de la liste de courses",
            shoppingList
        });
    } catch (error) {
        console.error("Erreur lors du retrait de la recette de la liste de courses:", error);
        return NextResponse.json(
            { error: "Erreur lors du retrait de la recette de la liste de courses" },
            { status: 500 }
        );
    }
}