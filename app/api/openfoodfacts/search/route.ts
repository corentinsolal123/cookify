// app/api/openfoodfacts/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        console.log(`🔍 Début proxy pour: "${query}"`);

        // Test simple d'abord
        if (!query) {
            return NextResponse.json({
                error: 'Paramètre q requis',
                test: 'Le proxy fonctionne !',
                debug: 'Pas de query'
            }, { status: 400 });
        }

        // Test de base : juste retourner que ça marche
        if (query === 'test') {
            return NextResponse.json({
                message: 'Proxy Next.js fonctionne !',
                query,
                timestamp: new Date().toISOString(),
                debug: 'Mode test'
            });
        }

        console.log(`📡 Tentative appel OpenFoodFacts...`);

        // Version simplifiée sans timeout qui peut poser problème
        const openFoodFactsUrl = `https://fr.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&json=1&page_size=5`;

        console.log(`📡 URL: ${openFoodFactsUrl}`);

        const response = await fetch(openFoodFactsUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Cookify-App/1.0',
                'Accept': 'application/json',
            }
            // ⚠️ Suppression du timeout qui peut causer des erreurs
        });

        console.log(`📡 Response status: ${response.status}`);

        if (!response.ok) {
            console.error(`❌ OpenFoodFacts error: ${response.status}`);
            return NextResponse.json({
                error: `OpenFoodFacts API error: ${response.status}`,
                details: response.statusText,
                query,
                debug: 'OpenFoodFacts response not ok'
            }, { status: 502 });
        }

        console.log(`📡 Parsing JSON...`);
        const data = await response.json();

        console.log(`✅ Data received, products: ${data.products?.length || 0}`);

        // Transformation simple et sécurisée
        const products = [];
        if (data.products && Array.isArray(data.products)) {
            for (const product of data.products.slice(0, 5)) {
                try {
                    const transformedProduct = {
                        fdcId: product._id || 'unknown',
                        description: product.product_name_fr || product.product_name || 'Produit sans nom',
                        foodNutrients: [
                            {
                                nutrientId: 1,
                                nutrientName: "Énergie",
                                value: parseFloat(product.nutriments?.["energy-kcal_100g"] || "0"),
                                unitName: "kcal"
                            },
                            {
                                nutrientId: 2,
                                nutrientName: "Protéines",
                                value: parseFloat(product.nutriments?.proteins_100g || "0"),
                                unitName: "g"
                            },
                            {
                                nutrientId: 3,
                                nutrientName: "Glucides",
                                value: parseFloat(product.nutriments?.carbohydrates_100g || "0"),
                                unitName: "g"
                            },
                            {
                                nutrientId: 4,
                                nutrientName: "Lipides",
                                value: parseFloat(product.nutriments?.fat_100g || "0"),
                                unitName: "g"
                            },
                            {
                                nutrientId: 5,
                                nutrientName: "Fibres",
                                value: parseFloat(product.nutriments?.fiber_100g || "0"),
                                unitName: "g"
                            }
                        ]
                    };
                    products.push(transformedProduct);
                } catch (productError) {
                    console.error(`⚠️ Erreur transformation produit:`, productError);
                    // Continuer avec les autres produits
                }
            }
        }

        console.log(`✅ Transformation terminée: ${products.length} produits`);

        return NextResponse.json({
            query,
            count: products.length,
            products,
            source: 'openfoodfacts-proxy',
            timestamp: new Date().toISOString(),
            debug: 'Success'
        });

    } catch (error) {
        console.error('❌ Erreur proxy complète:', error);

        return NextResponse.json({
            error: 'Erreur serveur',
            details: error instanceof Error ? error.message : 'Erreur inconnue',
            stack: error instanceof Error ? error.stack : undefined,
            query: new URL(request.url).searchParams.get('q'),
            debug: 'Catch error'
        }, { status: 500 });
    }
}