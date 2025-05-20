"use client";

import { useState, useEffect } from "react";
import { RecipeData } from "@/types/recipe";
import RecipeList from "./RecipeList";
import RecipeListSkeleton from "./RecipeListSkeleton";

interface RecipeListWrapperProps {
    recipes: RecipeData[];
}

export default function RecipeListWrapper({ recipes }: RecipeListWrapperProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [clientRecipes, setClientRecipes] = useState<RecipeData[]>([]);

    useEffect(() => {
        // Use the recipes passed from the server component
        setClientRecipes(recipes);
        // Simulate a short loading state for the skeleton
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [recipes]);

    if (isLoading) {
        return <RecipeListSkeleton />;
    }

    return <RecipeList recipes={clientRecipes} />;
}
