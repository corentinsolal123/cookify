// components/recipes/RecipeCardActions.tsx (Client Component pour les actions)
"use client";

import { Button, PressEvent } from "@heroui/button";
import { useState } from "react";

interface RecipeCardActionsProps {
    recipeId: string;
}

export function RecipeCardActions({ recipeId }: RecipeCardActionsProps) {
    const [isFavorited, setIsFavorited] = useState(false);

    const toggleFavorite = (e: PressEvent) => {
        setIsFavorited(!isFavorited);
        // Ici tu peux ajouter la logique pour sauvegarder en BDD
    };

    return (
        <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
            onPress={toggleFavorite}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'}`}
                fill={isFavorited ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </Button>
    );
}