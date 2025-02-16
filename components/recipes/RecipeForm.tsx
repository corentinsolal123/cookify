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
        // Réinitialiser le formulaire
        setTitre("");
        setDescription("");
        setEtapes("");
    };

    return (
        <Card isBlurred className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px]" shadow="sm">
            <CardBody>
                <form className="recipe-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <Input
                            label="Nom de la recette"
                            required
                            id="titre"
                            type="text"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Input
                            label="Description"
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <Input
                            label={"Étapes (séparées par une virgule) :"}
                            required
                            id="etapes"
                            type="text"
                            value={etapes}
                            onChange={(e) => setEtapes(e.target.value)}
                        />
                    </div>
                    <Button type="submit" variant="solid">
                        Créer la recette
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
}
