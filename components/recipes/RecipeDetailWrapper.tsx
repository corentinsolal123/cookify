"use client";

import { useState, useEffect } from "react";
import { RecipeData } from "@/types/recipe";
import RecipeDetail from "./RecipeDetail";
import RecipeDetailSkeleton from "./RecipeDetailSkeleton";

interface RecipeDetailWrapperProps {
    recipe: RecipeData;
}

export default function RecipeDetailWrapper({ recipe }: RecipeDetailWrapperProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [clientRecipe, setClientRecipe] = useState<RecipeData | null>(null);

    useEffect(() => {
        // Simulate loading delay to show skeleton
        // In a real app, this would be replaced by actual data fetching logic
        const timer = setTimeout(() => {
            setClientRecipe(recipe);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [recipe]);

    if (isLoading) {
        return <RecipeDetailSkeleton />;
    }

    return <RecipeDetail recipe={clientRecipe!} />;
}