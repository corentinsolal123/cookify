// components/recipes/RecipeActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Copy, Download, Edit, Heart, Printer, Share2 } from "lucide-react";

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
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">

                {/* Actions principales */}
                <div className="flex items-center gap-2">

                    {/* Bouton d'édition */}
                    <button
                        onClick={goToEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Modifier
                    </button>

                    {/* Bouton favoris */}
                    <button
                        onClick={toggleFavorite}
                        className={`p-2 rounded-lg border-2 transition-all ${
                            isFavorite
                                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>

                    {/* Bouton sauvegarde */}
                    <button
                        onClick={toggleSave}
                        className={`p-2 rounded-lg border-2 transition-all ${
                            isSaved
                                ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        title={isSaved ? "Retirer de mes collections" : "Sauvegarder"}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                </div>

                {/* Actions secondaires */}
                <div className="flex items-center gap-2">

                    {/* Bouton de partage */}
                    <button
                        onClick={shareRecipe}
                        disabled={shareLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Partager cette recette"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Partager</span>
                    </button>

                    {/* Bouton de copie de lien */}
                    <button
                        onClick={copyLink}
                        className={`p-2 rounded-lg transition-all ${
                            copied
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                        title="Copier le lien"
                    >
                        {copied ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>

                    {/* Menu déroulant pour les autres actions */}
                    <div className="relative group">
                        <button
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                            <span className="sr-only">Plus d'options</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {/* Menu déroulant */}
                        <div
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="py-1">
                                <button
                                    onClick={printRecipe}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <Printer className="w-4 h-4" />
                                    Imprimer
                                </button>

                                <button
                                    onClick={exportToPDF}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Exporter en PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indication de copie */}
            {copied && (
                <div className="mt-2 text-sm text-green-600 text-center">
                    Lien copié dans le presse-papiers !
                </div>
            )}
        </div>
    );
}