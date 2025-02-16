"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { IRecipe } from "@/types/recipe";

interface RecipeDetailProps {
    recipe: IRecipe;
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
    return (
        <div className="container">
            <Card
                isBlurred
                shadow="sm"
                className="recipe-card border-none bg-background/60 dark:bg-default-100/50"
            >
                <CardHeader>
                    <h1 className="title">{recipe.titre}</h1>
                </CardHeader>
                <Divider className="my-4" />
                <CardBody>
                    {recipe.description && <p className="description">{recipe.description}</p>}
                    <h2 className="sub-title">Étapes :</h2>
                    <ul className="steps">
                        {recipe.etapes.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ul>
                    {/* Vous pouvez ajouter ici l'affichage des ingrédients, tags, etc. */}
                </CardBody>
            </Card>

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 2rem auto;
                    padding: 1rem;
                    font-family: sans-serif;
                }

                .recipe-card {
                    background: var(--background, #fff);
                }

                .title {
                    font-size: 2rem;
                    font-weight: bold;
                }

                .description {
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    color: #555;
                }

                .sub-title {
                    margin-top: 1.5rem;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .steps {
                    list-style: disc;
                    padding-left: 1.5rem;
                }

                .steps li {
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
}
