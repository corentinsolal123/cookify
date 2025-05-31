// components/ui/TagsInput.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, X, Sparkles } from "lucide-react";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { TagData, TagCategory } from "@/types/tag";
import { getAllTags, createTag } from "@/lib/services/client/tagServices";

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    label?: string;
    placeholder?: string;
    description?: string;
    maxTags?: number;
    className?: string;
}

// Catégories prédéfinies avec leurs couleurs et descriptions
const TAG_CATEGORIES: Record<TagCategory, { label: string; color: string; description: string }> = {
    cuisine: {
        label: "Cuisine",
        color: "primary",
        description: "Type de plat, origine culinaire"
    },
    regime: {
        label: "Régime",
        color: "success",
        description: "Contraintes alimentaires, régimes spéciaux"
    },
    difficulte: {
        label: "Difficulté",
        color: "warning",
        description: "Niveau de complexité"
    },
    temps: {
        label: "Temps",
        color: "secondary",
        description: "Durée de préparation"
    },
    occasion: {
        label: "Occasion",
        color: "danger",
        description: "Moment, événement"
    }
};

interface TagSuggestion {
    id: string;
    name: string;
    category: TagCategory;
    isExisting: boolean;
    isNewSuggestion?: boolean;
}

export default function TagsInput({
                                      value = [],
                                      onChange,
                                      label = "Tags",
                                      placeholder = "Rechercher un tag...",
                                      description = "Choisissez parmi les tags existants",
                                      maxTags = 8,
                                      className = ""
                                  }: Readonly<TagsInputProps>) {
    const [existingTags, setExistingTags] = useState<TagData[]>([]);
    const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isCreatingTag, setIsCreatingTag] = useState(false);

    // Récupérer les tags existants au montage
    useEffect(() => {
        const fetchTags = async () => {
            setLoading(true);
            try {
                const tags = await getAllTags();
                setExistingTags(tags);
            } catch (error) {
                console.error("Erreur lors de la récupération des tags:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTags();
    }, []);

    // Générer les suggestions basées sur l'input
    useEffect(() => {
        if (!inputValue.trim()) {
            setSuggestions([]);
            return;
        }

        const query = inputValue.toLowerCase().trim();

        // 1. Rechercher dans les tags existants
        const existingSuggestions: TagSuggestion[] = existingTags
            .filter(tag =>
                tag.name.toLowerCase().includes(query) &&
                !value.includes(tag.name)
            )
            .map(tag => ({
                id: tag.id!,
                name: tag.name,
                category: tag.category as TagCategory,
                isExisting: true
            }));

        // 2. Si aucun tag existant exact, proposer création pour chaque catégorie
        const exactMatch = existingTags.find(tag => tag.name.toLowerCase() === query);
        const newSuggestions: TagSuggestion[] = [];

        if (!exactMatch && query.length >= 2) {
            Object.entries(TAG_CATEGORIES).forEach(([categoryKey, categoryInfo]) => {
                newSuggestions.push({
                    id: `new-${categoryKey}-${query}`,
                    name: query,
                    category: categoryKey as TagCategory,
                    isExisting: false,
                    isNewSuggestion: true
                });
            });
        }

        // Limiter les résultats pour la performance
        const allSuggestions = [...existingSuggestions, ...newSuggestions].slice(0, 10);
        setSuggestions(allSuggestions);
    }, [inputValue, existingTags, value]);

    // Créer un nouveau tag et l'ajouter
    const handleCreateAndAddTag = async (tagName: string, category: TagCategory) => {
        setIsCreatingTag(true);

        try {
            const newTag = await createTag({
                name: tagName.toLowerCase().trim(),
                slug: tagName.toLowerCase().trim().replace(/\s+/g, "-"),
                color: TAG_CATEGORIES[category].color,
                category: category
            });

            // Ajouter à la liste locale
            setExistingTags(prev => [...prev, newTag]);

            // Ajouter au formulaire
            addExistingTag(newTag.name);

        } catch (error) {
            console.error("Erreur lors de la création du tag:", error);
            // Ici tu pourrais afficher un toast d'erreur
        } finally {
            setIsCreatingTag(false);
        }
    };

    // Ajouter un tag existant à la sélection
    const addExistingTag = (tagName: string) => {
        if (value.includes(tagName) || value.length >= maxTags) return;

        const newTags = [...value, tagName];
        onChange(newTags);
        setInputValue("");
        setSuggestions([]);
    };

    // Supprimer un tag de la sélection
    const removeTag = (tagToRemove: string) => {
        const newTags = value.filter(tag => tag !== tagToRemove);
        onChange(newTags);
    };

    // Obtenir les infos d'affichage d'un tag
    const getTagDisplayInfo = (tagName: string) => {
        const existingTag = existingTags.find(tag => tag.name === tagName);
        if (existingTag) {
            const categoryInfo = TAG_CATEGORIES[existingTag.category as TagCategory];
            return {
                color: categoryInfo?.color || "default",
                category: categoryInfo?.label || existingTag.category
            };
        }
        return { color: "default", category: "Autre" };
    };

    return (
        <div className={`space-y-3 ${className}`}>

            {/* Tags sélectionnés */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-content2 rounded-lg border-2 border-divider min-h-12">
                    {value.map((tag, index) => {
                        const displayInfo = getTagDisplayInfo(tag);
                        return (
                            <Chip
                                key={`${tag}-${index}`}
                                variant="flat"
                                color={displayInfo.color as any}
                                size="sm"
                                startContent={<Tag className="w-3 h-3" />}
                                endContent={
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        className="w-4 h-4 min-w-4 p-0 ml-1 hover:bg-danger/20"
                                        onPress={() => removeTag(tag)}
                                        aria-label={`Supprimer le tag ${tag}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                }
                                className="cursor-default"
                            >
                <span className="flex items-center gap-1">
                  #{tag}
                    <span className="text-xs opacity-60">({displayInfo.category})</span>
                </span>
                            </Chip>
                        );
                    })}
                </div>
            )}

            {/* Autocomplete pour recherche */}
            <Autocomplete
                label={label}
                placeholder={placeholder}
                startContent={<Tag className="w-4 h-4 text-default-400" />}
                isLoading={loading || isCreatingTag}
                inputValue={inputValue}
                onInputChange={setInputValue}
                isDisabled={value.length >= maxTags}
                items={suggestions}
                onSelectionChange={(key) => {
                    if (!key) return;

                    const suggestion = suggestions.find(s => s.id === key);
                    if (!suggestion) return;

                    if (suggestion.isExisting) {
                        addExistingTag(suggestion.name);
                    } else {
                        handleCreateAndAddTag(suggestion.name, suggestion.category);
                    }
                }}
            >
                {(suggestion) => (
                    <AutocompleteItem
                        key={suggestion.id}
                        textValue={suggestion.name}
                        className={suggestion.isNewSuggestion ? "border-l-4 border-l-warning" : ""}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                {suggestion.isNewSuggestion ? (
                                    <Sparkles className="w-3 h-3 text-warning" />
                                ) : (
                                    <Tag className="w-3 h-3 text-default-400" />
                                )}
                                <span>#{suggestion.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Chip
                                    size="sm"
                                    variant="dot"
                                    color={TAG_CATEGORIES[suggestion.category].color as any}
                                >
                                    {TAG_CATEGORIES[suggestion.category].label}
                                </Chip>

                                {suggestion.isNewSuggestion && (
                                    <span className="text-xs text-warning">Créer</span>
                                )}
                            </div>
                        </div>

                        {/* Description de la catégorie pour les nouveaux tags */}
                        {suggestion.isNewSuggestion && (
                            <div className="text-xs text-default-500 mt-1">
                                {TAG_CATEGORIES[suggestion.category].description}
                            </div>
                        )}
                    </AutocompleteItem>
                )}
            </Autocomplete>

            {/* Compteur et description */}
            <div className="flex items-center justify-between text-xs text-default-500">
                <span>{description}</span>
                <span className={value.length >= maxTags ? "text-warning" : ""}>
          {value.length}/{maxTags} tags
        </span>
            </div>

            {/* Tags populaires pour démarrer */}
            {value.length === 0 && !loading && existingTags.length > 0 && !inputValue && (
                <div className="space-y-2">
                    <p className="text-xs text-default-500">Tags populaires :</p>
                    <div className="flex flex-wrap gap-1">
                        {existingTags
                            .slice(0, 6)
                            .map((tag) => {
                                const categoryInfo = TAG_CATEGORIES[tag.category as TagCategory];
                                return (
                                    <Button
                                        key={tag.id}
                                        size="sm"
                                        variant="bordered"
                                        color={categoryInfo?.color as any}
                                        startContent={<Plus className="w-3 h-3" />}
                                        onPress={() => addExistingTag(tag.name)}
                                        className="h-6 px-2 text-xs"
                                        isDisabled={value.includes(tag.name)}
                                    >
                                        #{tag.name}
                                    </Button>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}