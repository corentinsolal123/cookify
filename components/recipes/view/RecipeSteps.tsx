// components/recipes/RecipeSteps.tsx
'use client';

import { useState } from 'react';
import { Clock, ChefHat, CheckCircle2, Circle } from 'lucide-react';
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";

interface RecipeStepsProps {
    steps: string[];
    prepTime: number;
    cookTime: number;
}

export default function RecipeSteps({
                                        steps,
                                        prepTime,
                                        cookTime
                                    }: Readonly<RecipeStepsProps>) {
    // État pour suivre les étapes complétées (utile pour la cuisine)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Fonction pour marquer/démarquer une étape comme complétée
    const toggleStepComplete = (stepIndex: number) => {
        const newCompleted = new Set(completedSteps);
        if (newCompleted.has(stepIndex)) {
            newCompleted.delete(stepIndex);
        } else {
            newCompleted.add(stepIndex);
        }
        setCompletedSteps(newCompleted);
    };

    // Calcul du progrès
    const progress = (completedSteps.size / steps.length) * 100;

    return (
        <Card className="p-6">

            {/* En-tête avec temps de préparation */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold">
                        Préparation
                    </h2>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Préparation: {prepTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Cuisson: {cookTime} min</span>
                    </div>
                </div>
            </div>

            {/* Barre de progression */}
            {completedSteps.size > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progression
                        </span>
                        <span className="text-sm text-gray-600">
                            {completedSteps.size}/{steps.length} étapes
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Liste des étapes */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(index);

                    return (
                        <Card
                            key={index}
                            className={`relative flex-row gap-4 p-4 border-1 ${
                                isCompleted
                                    ? 'bg-green-50 border-green-200'
                                    : ''
                            }`}
                        >

                            {/* Numéro de l'étape / Bouton de completion */}
                            <div className="flex-shrink-0">
                                <Button
                                    isIconOnly
                                    onPress={() => toggleStepComplete(index)}
                                    className={`w-8 h-8 rounded-full ${
                                        isCompleted
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : ''
                                    }`}
                                    aria-label={isCompleted ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </Button>
                            </div>

                            {/* Contenu de l'étape */}
                            <div className="flex-1">
                                {/* En-tête avec numéro d'étape */}
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`font-medium ${
                                        isCompleted ? 'text-green-800' : ''
                                    }`}>
                                        Étape {index + 1}
                                    </h3>

                                    {/* Estimation du temps pour cette étape (optionnel) */}
                                    {index === 0 && prepTime > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            ~{Math.round(prepTime / steps.length)} min
                                        </span>
                                    )}
                                </div>

                                {/* Texte de l'étape */}
                                <p className={`leading-relaxed ${
                                    isCompleted
                                        ? 'text-green-700 line-through'
                                        : ''
                                }`}>
                                    {step}
                                </p>

                                {/* Conseils automatiques basés sur le contenu */}
                                {step.toLowerCase().includes('four') && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                        💡 N'oublie pas de préchauffer ton four !
                                    </div>
                                )}

                                {step.toLowerCase().includes('repos') && (
                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                        ⏰ Profite de ce temps pour préparer la suite !
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Message de félicitations */}
            {completedSteps.size === steps.length && steps.length > 0 && (
                <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">
              Félicitations ! Tu as terminé toutes les étapes ! 🎉
            </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                        Ta recette est prête à être dégustée. Bon appétit !
                    </p>
                </div>
            )}
        </Card>
    );
}