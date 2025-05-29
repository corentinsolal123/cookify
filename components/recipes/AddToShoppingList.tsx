"use client";

import React, { useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { useAuth } from "@/lib/auth/AuthProvider";

interface AddToShoppingListProps {
    recipeId: string;
    recipeName: string;
}

export default function AddToShoppingList({ recipeId, recipeName }: Readonly<AddToShoppingListProps>) {
    const [servings, setServings] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");
    const { user } = useAuth();

    const handleAddToShoppingList = async () => {
        if (!user) {
            setMessage("Vous devez être connecté pour ajouter à votre liste de courses");
            setMessageType("error");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await fetch("/api/shopping-list/recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipeId, servings }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'ajout à la liste de courses");
            }

            setMessage(`${recipeName} ajouté à votre liste de courses`);
            setMessageType("success");
        } catch (error) {
            console.error("Erreur:", error);
            setMessage("Erreur lors de l'ajout à la liste de courses");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-row gap-4 items-center">
                <Input
                    type="number"
                    label="Nombre de portions"
                    min={1}
                    max={20}
                    value={servings.toString()}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className="w-40"
                />
                <Button
                    color="primary"
                    onPress={handleAddToShoppingList}
                    isDisabled={loading || !user}
                >
                    {loading ? (
                        <Spinner size="sm" color="white" />
                    ) : (
                        "Ajouter à ma liste de courses"
                    )}
                </Button>
            </div>
            
            {message && (
                <p className={`text-sm ${messageType === "success" ? "text-success" : "text-danger"}`}>
                    {message}
                </p>
            )}
            
            {!user && (
                <p className="text-sm text-danger">
                    Vous devez être <a href="/login" className="underline">connecté</a> pour utiliser cette fonctionnalité
                </p>
            )}
        </div>
    );
}