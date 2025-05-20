import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import ShoppingList from "@/models/ShoppingList";
import Recipe from "@/models/Recipe";
import mongoose from "mongoose";

// Get the user's shopping list
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        
        const userId = session.user.id;
        
        // Find or create a shopping list for the user
        let shoppingList = await ShoppingList.findOne({ userId })
            .populate({
                path: 'recipes',
                select: 'name'
            });
        
        if (!shoppingList) {
            shoppingList = await ShoppingList.create({
                userId,
                name: "Ma liste de courses",
                items: [],
                recipes: []
            });
        }
        
        return NextResponse.json(shoppingList);
    } catch (error) {
        console.error("Erreur lors de la récupération de la liste de courses:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la liste de courses" },
            { status: 500 }
        );
    }
}

// Clear the shopping list
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        
        const userId = session.user.id;
        
        // Find the user's shopping list
        const shoppingList = await ShoppingList.findOne({ userId });
        
        if (!shoppingList) {
            return NextResponse.json(
                { error: "Liste de courses non trouvée" },
                { status: 404 }
            );
        }
        
        // Clear the items and recipes
        shoppingList.items = [];
        shoppingList.recipes = [];
        await shoppingList.save();
        
        return NextResponse.json({ message: "Liste de courses vidée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la liste de courses:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression de la liste de courses" },
            { status: 500 }
        );
    }
}