// components/recipes/RecipeActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Copy, Download, Edit, Heart, Printer, Share2 } from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";

interface RecipeActionsProps {
    recipeId: string;
    recipeName: string;
}

export default function RecipeActions({ recipeId, recipeName }: Readonly<RecipeActionsProps>) {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fonction pour basculer les favoris
    const toggleFavorite = async () => {
        try {
            const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
                method: isFavorite ? "DELETE" : "POST"
            });

            if (response.ok) {
                setIsFavorite(!isFavorite);
            }
        } catch (error) {
            console.error("Erreur lors de la gestion des favoris:", error);
        }
    };

    // Fonction pour sauvegarder/enlever de la collection
    const toggleSave = async () => {
        try {
            const response = await fetch(`/api/recipes/${recipeId}/save`, {
                method: isSaved ? "DELETE" : "POST"
            });

            if (response.ok) {
                setIsSaved(!isSaved);
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        }
    };

    // Fonction pour partager la recette
    const shareRecipe = async () => {
        setShareLoading(true);

        try {
            // Si l'API Web Share est disponible (mobile principalement)
            if (navigator.share) {
                await navigator.share({
                    title: recipeName,
                    text: `Découvre cette délicieuse recette : ${recipeName}`,
                    url: window.location.href
                });
            } else {
                // Fallback : copier le lien
                await copyLink();
            }
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                console.error("Erreur lors du partage:", error);
                // Fallback vers la copie du lien
                await copyLink();
            }
        } finally {
            setShareLoading(false);
        }
    };

    // Fonction pour copier le lien
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Erreur lors de la copie:", error);
        }
    };

    // Fonction pour imprimer la recette
    const printRecipe = () => {
        window.print();
    };

    // Fonction pour exporter en PDF (simplifié)
    const exportToPDF = async () => {
        try {
            const response = await fetch(`/api/recipes/${recipeId}/export/pdf`, {
                method: "POST"
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${recipeName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Erreur lors de l'export PDF:", error);
        }
    };

    // Navigation vers l'édition
    const goToEdit = () => {
        router.push(`/recipes/${recipeId}/edit`);
    };

    return (
        <Card className="p-6">
            <CardBody className="flex flex-row flex-wrap items-center justify-between">

                {/* Actions principales */}
                <div className="flex items-center gap-2">

                    {/* Bouton d'édition */}
                    <Button
                        startContent={<Edit className="w-4 h-4" />}
                        onPress={goToEdit}
                        color={"primary"}>
                        Modifier
                    </Button>

                    {/* Bouton favoris */}
                    <Button
                        onPress={toggleFavorite}
                        isIconOnly
                        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </Button>

                    {/* Bouton sauvegarde */}
                    <Button
                        onPress={toggleSave}
                        isIconOnly
                        aria-label={isSaved ? "Retirer de mes collections" : "Sauvegarder"}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </Button>
                </div>

                {/* Actions secondaires */}
                <div className="flex items-center gap-2">

                    {/* Bouton de partage */}
                    <Button
                        onPress={shareRecipe}
                        disabled={shareLoading}
                        title="Partager cette recette"
                        startContent={<Share2 className="w-4 h-4" />}
                    >
                        <span className="hidden sm:inline">Partager</span>
                    </Button>

                    {/* Bouton de copie de lien */}
                    <Button
                        onPress={copyLink}
                        isIconOnly
                        title="Copier le lien"
                    >
                        {copied ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>

                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="print" onPress={printRecipe}>
                                <span className="flex gap-2.5 items-center">
                                    <Printer className="w-4 h-4" />Imprimer
                                </span>
                            </DropdownItem>
                            <DropdownItem key="pdf" onPress={exportToPDF}>
                                <span className="flex gap-2.5 items-center">
                                    <Download className="w-4 h-4" />Exporter en PDF
                                </span>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </CardBody>

            {/* Indication de copie */}
            {copied && (
                <div className="mt-2 text-sm text-green-600 text-center">
                    Lien copié dans le presse-papiers !
                </div>
            )}
        </Card>
    );
}