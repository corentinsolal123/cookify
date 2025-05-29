// components/recipes/RecipeHeader.tsx
import Image from 'next/image';
import { Clock, Users, ChefHat } from 'lucide-react';
import { RecipeData } from '@/types/recipe';

interface RecipeHeaderProps {
    recipe: RecipeData;
    totalTime: number;
}

// Fonction utilitaire pour les couleurs de difficulté
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'facile': return 'bg-green-100 text-green-800';
        case 'moyen': return 'bg-yellow-100 text-yellow-800';
        case 'difficile': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function RecipeHeader({ recipe, totalTime }: Readonly<RecipeHeaderProps>) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">

            {/* Image de la recette */}
            <div className="relative h-64 md:h-80">
                {recipe.image ? (
                    <Image
                        src={recipe.image}
                        alt={recipe.name}
                        fill
                        className="object-cover"
                        priority // Charge l'image en priorité (LCP optimization)
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ChefHat className="w-16 h-16 text-gray-400" />
                    </div>
                )}

                {/* Overlay avec badge de difficulté */}
                <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
                </div>
            </div>

            {/* Informations principales */}
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {recipe.name}
                </h1>

                {recipe.description && (
                    <p className="text-gray-600 mb-4">
                        {recipe.description}
                    </p>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>Par {recipe.creator}</span>
                    {recipe.created_at && (
                        <>
                            <span className="mx-2">•</span>
                            <span>
                {new Date(recipe.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}
              </span>
                        </>
                    )}
                </div>

                {/* Métriques rapides */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">
              <span className="font-medium">{totalTime} min</span> au total
            </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">
              <span className="font-medium">{recipe.servings}</span> portion{recipe.servings > 1 ? 's' : ''}
            </span>
                    </div>

                    {recipe.calories && (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">C</span>
                            </div>
                            <span className="text-gray-600">
                <span className="font-medium">{Math.round(recipe.calories / recipe.servings)}</span> cal/portion
              </span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {recipe.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                #{tag}
              </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}