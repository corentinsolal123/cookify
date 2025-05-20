import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ShoppingList from "@/models/ShoppingList";
import { UpdateShoppingListItemRequest } from "@/types/shoppingList";

// Update an item in the shopping list
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession();
        
        if (!session || !session.user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }
        
        const userId = session.user.id;
        const data: UpdateShoppingListItemRequest = await req.json();
        
        if (!data.itemId) {
            return NextResponse.json(
                { error: "ID de l'élément requis" },
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
        
        // Find and update the item
        const itemIndex = shoppingList.items.findIndex(
            (item) => item._id.toString() === data.itemId
        );
        
        if (itemIndex === -1) {
            return NextResponse.json(
                { error: "Élément non trouvé dans la liste" },
                { status: 404 }
            );
        }
        
        // Update the item properties
        if (data.checked !== undefined) {
            shoppingList.items[itemIndex].checked = data.checked;
        }
        
        if (data.quantity !== undefined) {
            shoppingList.items[itemIndex].quantity = data.quantity;
        }
        
        await shoppingList.save();
        
        return NextResponse.json({ 
            message: "Élément mis à jour avec succès",
            item: shoppingList.items[itemIndex]
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'élément:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de l'élément" },
            { status: 500 }
        );
    }
}