// components/recipes/edit/RecipeStepsEditor.tsx
'use client';

import { useState, useRef } from 'react';
import { Plus, X, GripVertical, ArrowUp, ArrowDown, Lightbulb } from 'lucide-react';

interface RecipeStepsEditorProps {
    steps: string[];
    error?: string;
    onChange: (steps: string[]) => void;
}

// Suggestions intelligentes basées sur le contenu
const getStepSuggestions = (step: string) => {
    const suggestions = [];
    const lowerStep = step.toLowerCase();

    if (lowerStep.includes('four') && !lowerStep.includes('préchauff')) {
        suggestions.push('💡 N\'oublie pas de préchauffer ton four !');
    }

    if (lowerStep.includes('mélang') && !lowerStep.includes('délicatement')) {
        suggestions.push('💡 Pense à mélanger délicatement pour garder la texture');
    }

    if (lowerStep.includes('cuisson') && !lowerStep.includes('température')) {
        suggestions.push('💡 Précise la température de cuisson');
    }

    if (lowerStep.includes('repos') && !lowerStep.includes('minute')) {
        suggestions.push('💡 Indique la durée de repos');
    }

    return suggestions;
};

// Templates d'étapes courantes
const STEP_TEMPLATES = [
    'Préchauffez le four à 180°C.',
    'Dans un saladier, mélangez tous les ingrédients secs.',
    'Ajoutez les ingrédients liquides et mélangez jusqu\'à obtenir une pâte homogène.',
    'Étalez la pâte sur une surface farinée.',
    'Laissez reposer pendant X minutes.',
    'Enfournez pour X minutes jusqu\'à ce que ce soit doré.',
    'Laissez refroidir avant de servir.'
];

export default function RecipeStepsEditor({
                                              steps,
                                              error,
                                              onChange
                                          }: RecipeStepsEditorProps) {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

    const dragCounter = useRef(0);

    // Ajouter une nouvelle étape
    const addStep = (template?: string) => {
        const newSteps = [...steps, template || ''];
        onChange(newSteps);
        setShowTemplates(false);
    };

    // Supprimer une étape
    const removeStep = (index: number) => {
        if (steps.length <= 1) return; // Garder au moins une étape

        const newSteps = steps.filter((_, i) => i !== index);
        onChange(newSteps);
    };

    // Modifier une étape
    const updateStep = (index: number, value: string) => {
        const newSteps = steps.map((step, i) =>
            i === index ? value : step
        );
        onChange(newSteps);
    };

    // Déplacer une étape vers le haut
    const moveStepUp = (index: number) => {
        if (index === 0) return;

        const newSteps = [...steps];
        [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
        onChange(newSteps);
    };

    // Déplacer une étape vers le bas
    const moveStepDown = (index: number) => {
        if (index === steps.length - 1) return;

        const newSteps = [...steps];
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
        onChange(newSteps);
    };

    // Gestion du drag & drop
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current++;
    };

    const handleDragLeave = (e: React.DragEvent) => {
        dragCounter.current--;
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        dragCounter.current = 0;

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newSteps = [...steps];
        const draggedStep = newSteps[draggedIndex];

        // Supprimer l'élément de sa position originale
        newSteps.splice(draggedIndex, 1);

        // L'insérer à la nouvelle position
        const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newSteps.splice(insertIndex, 0, draggedStep);

        onChange(newSteps);
        setDraggedIndex(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            E
          </span>
                    Étapes de préparation
                </h2>

                <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {steps.filter(step => step.trim()).length} étape{steps.filter(step => step.trim()).length > 1 ? 's' : ''}
          </span>

                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Templates
                    </button>
                </div>
            </div>

            {/* Templates d'étapes */}
            {showTemplates && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Étapes courantes
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {STEP_TEMPLATES.map((template, index) => (
                            <button
                                key={index}
                                onClick={() => addStep(template)}
                                className="text-left p-2 text-sm text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            >
                                {template}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Liste des étapes */}
            <div className="space-y-4 mb-6">
                {steps.map((step, index) => {
                    const suggestions = getStepSuggestions(step);
                    const isEmpty = !step.trim();

                    return (
                        <div
                            key={index}
                            className={`relative border-2 rounded-lg transition-all ${
                                draggedIndex === index
                                    ? 'border-blue-300 bg-blue-50 scale-105'
                                    : isEmpty
                                        ? 'border-gray-200 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <div className="p-4">

                                {/* En-tête de l'étape */}
                                <div className="flex items-center gap-3 mb-3">

                                    {/* Drag handle */}
                                    <div className="flex-shrink-0 cursor-move">
                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                    </div>

                                    {/* Numéro de l'étape */}
                                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    {/* Titre */}
                                    <h3 className="font-medium text-gray-900 flex-1">
                                        Étape {index + 1}
                                    </h3>

                                    {/* Actions rapides */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveStepUp(index)}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Déplacer vers le haut"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => moveStepDown(index)}
                                            disabled={index === steps.length - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Déplacer vers le bas"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => removeStep(index)}
                                            disabled={steps.length <= 1}
                                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                            title="Supprimer cette étape"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Zone de texte pour l'étape */}
                                <textarea
                                    value={step}
                                    onChange={(e) => updateStep(index, e.target.value)}
                                    onFocus={() => setActiveStepIndex(index)}
                                    onBlur={() => setActiveStepIndex(null)}
                                    className={`w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        isEmpty ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
                                    }`}
                                    rows={3}
                                    placeholder={`Décris l'étape ${index + 1} de ta recette...`}
                                    maxLength={1000}
                                />

                                {/* Compteur de caractères */}
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-xs text-gray-500">
                                        {step.length}/1000 caractères
                                    </div>

                                    {/* Indicateur d'étape vide */}
                                    {isEmpty && (
                                        <div className="text-xs text-orange-600">
                                            Étape vide
                                        </div>
                                    )}
                                </div>

                                {/* Suggestions intelligentes */}
                                {suggestions.length > 0 && activeStepIndex === index && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="space-y-1">
                                            {suggestions.map((suggestion, suggestionIndex) => (
                                                <p key={suggestionIndex} className="text-xs text-yellow-800">
                                                    {suggestion}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bouton d'ajout */}
            <button
                onClick={() => addStep()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 hover:border-purple-500 text-gray-600 hover:text-purple-600 rounded-lg transition-colors"
            >
                <Plus className="w-4 h-4" />
                Ajouter une étape
            </button>

            {/* Erreur */}
            {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            {/* Conseils pour de bonnes étapes */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Conseils pour de bonnes étapes
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Utilise des verbes d'action clairs (mélanger, chauffer, ajouter...)</li>
                    <li>• Précise les temps et les températures</li>
                    <li>• Indique les indices visuels (« jusqu'à ce que ce soit doré »)</li>
                    <li>• Divise les actions complexes en plusieurs étapes</li>
                    <li>• Mentionne les ustensiles nécessaires</li>
                </ul>
            </div>
        </div>
    );
}