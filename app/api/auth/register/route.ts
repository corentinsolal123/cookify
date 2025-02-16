// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByUsername } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json();
        if (!username || !email || !password) {
            return NextResponse.json({ message: "Champs manquants" }, { status: 400 });
        }

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return NextResponse.json({ message: "Utilisateur déjà existant" }, { status: 400 });
        }

        // Crée l'utilisateur
        const user = await createUser(username, email, password);
        return NextResponse.json({ message: "Utilisateur créé", user }, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
