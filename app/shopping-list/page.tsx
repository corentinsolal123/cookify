"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, Spinner, Checkbox, Button, Input } from "@heroui/react";
import { ShoppingListData, ShoppingListItemData } from "@/types/shoppingList";

export default function ShoppingListPage() {
    const { data: session, status } = useSession();
    const [shoppingList, setShoppingList] = useState<ShoppingListData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            fetchShoppingList();
        } else if (status === "unauthenticated") {
            setLoading(false);
            setError("Vous devez être connecté pour accéder à votre liste de courses.");
        }
    }, [status]);

    const fetchShoppingList = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/shopping-list");
            
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération de la liste de courses");
            }
            
            const data = await response.json();
            setShoppingList(data);
            setLoading(false);
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de charger votre liste de courses.");
            setLoading(false);
        }
    };

    const handleItemCheck = async (itemId: string, checked: boolean) => {
        try {
            const response = await fetch(`/api/shopping-list/items`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, checked }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la mise à jour de l'élément");
            }

            // Update local state
            setShoppingList(prevList => {
                if (!prevList) return null;
                
                return {
                    ...prevList,
                    items: prevList.items.map(item => 
                        item._id === itemId ? { ...item, checked } : item
                    )
                };
            });
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de mettre à jour l'élément.");
        }
    };

    const handleClearList = async () => {
        if (!confirm("Êtes-vous sûr de vouloir vider votre liste de courses ?")) {
            return;
        }

        try {
            const response = await fetch(`/api/shopping-list`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la suppression de la liste");
            }

            // Refresh the list
            fetchShoppingList();
        } catch (error) {
            console.error("Erreur:", error);
            setError("Impossible de vider la liste de courses.");
        }
    };

    const handlePrintList = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Card isBlurred className="p-6 max-w-md">
                    <p className="text-danger">{error}</p>
                    {status === "unauthenticated" && (
                        <Button as="a" href="/login" className="mt-4">
                            Se connecter
                        </Button>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Ma Liste de Courses</h1>
            
            {shoppingList && shoppingList.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Card isBlurred className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Ingrédients</h2>
                                <div className="flex gap-2">
                                    <Button 
                                        size="sm" 
                                        variant="flat" 
                                        color="primary"
                                        onPress={handlePrintList}
                                    >
                                        Imprimer
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="flat" 
                                        color="danger"
                                        onPress={handleClearList}
                                    >
                                        Vider la liste
                                    </Button>
                                </div>
                            </div>
                            
                            <ul className="space-y-2 print:text-black">
                                {shoppingList.items.map((item) => (
                                    <li key={item._id} className="flex items-center p-2 border-b">
                                        <Checkbox
                                            isSelected={item.checked}
                                            onValueChange={(checked) => handleItemCheck(item._id!, checked)}
                                            className="print:hidden"
                                        />
                                        <span className={`ml-2 flex-1 ${item.checked ? 'line-through text-gray-400' : ''}`}>
                                            {item.name} - {item.quantity} {item.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                    
                    <div>
                        <Card isBlurred className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Recettes incluses</h2>
                            {Array.isArray(shoppingList.recipes) && shoppingList.recipes.length > 0 ? (
                                <ul className="space-y-2">
                                    {shoppingList.recipes.map((recipe: any) => (
                                        <li key={typeof recipe === 'string' ? recipe : recipe._id} className="p-2 border-b">
                                            {typeof recipe === 'string' ? recipe : recipe.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Aucune recette ajoutée</p>
                            )}
                        </Card>
                    </div>
                </div>
            ) : (
                <Card isBlurred className="p-6 max-w-md mx-auto">
                    <p className="text-center mb-4">Votre liste de courses est vide.</p>
                    <Button as="a" href="/recipes" className="w-full">
                        Parcourir les recettes
                    </Button>
                </Card>
            )}
        </div>
    );
}