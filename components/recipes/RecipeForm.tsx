"use client";

import { Button, Card, CardBody, Input } from "@heroui/react";
import React, { useState } from "react";

interface RecipeFormData {
    titre: string;
    description: string;
    etapes: string[];
}

interface RecipeFormProps {
    onSubmit: (data: RecipeFormData) => void;
}

export default function RecipeForm({ onSubmit }: RecipeFormProps) {
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [etapes, setEtapes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const etapesArray = etapes.split(",").map((step) => step.trim());

        onSubmit({ titre, description, etapes: etapesArray });

        // Réinitialisation du formulaire
        setTitre("");
        setDescription("");
        setEtapes("");
    };

    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-lg  shadow-xl rounded-2xl p-6">
                <CardBody>
                    <h2 className="text-2xl font-semibold text-center  mb-6">
                        Ajouter une recette 🍽️
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nom de la recette"
                            required
                            id="titre"
                            type="text"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                        />
                        <Input
                            label="Description"
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <Input
                            label="Étapes (séparées par une virgule)"
                            required
                            id="etapes"
                            type="text"
                            value={etapes}
                            onChange={(e) => setEtapes(e.target.value)}
                        />
                        <Button type="submit" variant="solid" className="w-full">
                            Créer la recette
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
