// app/api/recipes/route.ts
import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/dbConnect";
import Recipe from "@/models/Recipe";

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const recipes = await Recipe.find({});

        return NextResponse.json(recipes, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des recettes :", error);

        return NextResponse.json(
            { message: "Erreur lors de la récupération des recettes" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const data = await request.json();
        const newRecipe = await Recipe.create(data);

        return NextResponse.json(newRecipe, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création de la recette :", error);

        return NextResponse.json(
            { message: "Erreur lors de la création de la recette" },
            { status: 500 }
        );
    }
}
