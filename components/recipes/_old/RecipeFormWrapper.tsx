"use client";

import { useState, useEffect } from "react";
import { RecipeData } from "@/types/recipe";
import { IngredientData } from "@/types/ingredient";
import RecipeForm from "./RecipeForm";
import RecipeFormSkeleton from "./RecipeFormSkeleton";

interface RecipeFormWrapperProps {
    onSubmit: (data: RecipeData) => void;
    initialData: RecipeData;
    isNew: boolean;
    existingIngredients?: IngredientData[];
}

export default function RecipeFormWrapper({ 
    onSubmit, 
    initialData, 
    isNew,
    existingIngredients = []
}: RecipeFormWrapperProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [clientInitialData, setClientInitialData] = useState<RecipeData | null>(null);

    useEffect(() => {
        // Simulate loading delay to show skeleton
        // In a real app, this would be replaced by actual data fetching logic
        const timer = setTimeout(() => {
            setClientInitialData(initialData);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [initialData]);

    if (isLoading) {
        return <RecipeFormSkeleton />;
    }

    return (
        <RecipeForm 
            onSubmit={onSubmit} 
            initialData={clientInitialData!} 
            isNew={isNew} 
        />
    );
}