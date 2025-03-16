import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Aucun ingrédient spécifié." }, { status: 400 });
    }

    try {
        // 🔍 Recherche sur OpenFoodFacts
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/products.json?search={query}&fields=product_name,nutriments`);
        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            return NextResponse.json({ error: "Aucun ingrédient trouvé." }, { status: 404 });
        }

        // 📝 Extraction des informations utiles
        const ingredients = data.products.map((product: any) => ({
            name: product.product_name || "Ingrédient inconnu",
            calories: product.nutriments?.["energy-kcal_100g"] || 0,
            quantityPerServing: 100,
            unit: "g",
        }));

        return NextResponse.json(ingredients);
    } catch (error) {
        console.error("Erreur API OpenFoodFacts :", error);
        return NextResponse.json({ error: "Erreur de récupération des ingrédients." }, { status: 500 });
    }
}
