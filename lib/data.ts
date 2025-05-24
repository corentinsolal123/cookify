// lib/data.ts
import clientPromise from "./mongodb";

export async function getStats() {
    try {
        const client = await clientPromise;
        const db = client.db('cookifyDB'); // Ta database

        // Compte les documents dans tes collections
        const recipesCount = await db.collection('recipes').countDocuments();
        const usersCount = await db.collection('users').countDocuments();

        return {
            recipesCount,
            usersCount,
            support: "24/7"  // Static pour l'instant
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        // Valeurs par défaut en cas d'erreur
        return {
            recipesCount: 0,
            usersCount: 0,
            support: "24/7"
        };
    }
}

export async function getFeaturedRecipe() {
    try {
        const client = await clientPromise;
        const db = client.db('cookifyDB'); // Ta database

        // Récupère une recette aléatoire ou la plus récente
        const featuredRecipe = await db.collection('recipes')
            .aggregate([
                { $sample: { size: 1 } } // Recette aléatoire
                // Ou utilise : .findOne({}, { sort: { createdAt: -1 } }) pour la plus récente
            ])
            .toArray();

        if (featuredRecipe.length > 0) {
            const recipe = featuredRecipe[0];
            return {
                _id: recipe._id,
                name: recipe.name,
                description: recipe.description,
                image: recipe.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
                difficulty: recipe.difficulty,
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime
            };
        }

        // Recette par défaut si aucune trouvée
        return {
            _id: 'default',
            name: "Salade Méditerranéenne",
            description: "Une salade fraîche et colorée avec des tomates, concombres, olives et feta, assaisonnée d'huile d'olive et d'herbes.",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
            difficulty: "Facile",
            prepTime: 15,
            cookTime: 0
        };
    } catch (error) {
        console.error('Erreur lors de la récupération de la recette en vedette:', error);
        // Recette par défaut en cas d'erreur
        return {
            _id: 'default',
            name: "Salade Méditerranéenne",
            description: "Une salade fraîche et colorée avec des tomates, concombres, olives et feta, assaisonnée d'huile d'olive et d'herbes.",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80",
            difficulty: "Facile",
            prepTime: 15,
            cookTime: 0
        };
    }
}