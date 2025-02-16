// app/api/recipes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Recipe from "@/models/Recipe";

export async function GET(request: NextRequest, { params }: any) {
    await dbConnect();
    const { id } = params;

    // Vérifier si l'ID est un ObjectId valide
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json(
            { message: "ID de recette invalide" },
            { status: 400 }
        );
    }

    try {
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return NextResponse.json(
                { message: "Recette non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json(recipe, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération de la recette :", error);
        return NextResponse.json(
            { message: "Erreur lors de la récupération de la recette" },
            { status: 500 }
        );
    }
}
