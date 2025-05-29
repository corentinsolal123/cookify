// components/ui/TagsInput.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { createTag } from "@/lib/services/client/tagServices";
import { TagData } from "@/types/tag";

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    label?: string;
    placeholder?: string;
    description?: string;
    maxTags?: number;
    className?: string;
    allowCreate?: boolean;
}

export default function TagsInput({
                                      value = [],
                                      onChange,
                                      label = "Tags",
                                      placeholder = "Rechercher ou créer un tag...",
                                      description = "Appuie sur Entrée pour ajouter un tag",
                                      maxTags = 10,
                                      className = "",
                                      allowCreate = true
                                  }: Readonly<TagsInputProps>) {
    const [tags, setTags] = useState<TagData[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Récupérer les tags existants depuis la base
    const fetchExistingTags = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/tags");
            if (response.ok) {
                const tags = await response.json();
                setTags(tags);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des tags:", error);
        } finally {
            setLoading(false);
        }
    };

    // Charger les tags au montage
    useEffect(() => {
        fetchExistingTags();
    }, []);

    // Créer un nouveau tag
    const createNewTag = async (tagName: string) => {
        if (!allowCreate) return null;

        try {
            const newTag = await createTag({
                name: tagName.trim().toLowerCase(),
                slug: tagName.trim().toLowerCase().replace(/ /g, "-"),
                color: "#3b82f6",
                category: "cuisine"
            });

            // Ajouter le nouveau tag à la liste
            const newTags: TagData[] = [...tags, newTag];
            setTags(newTags);
            return newTag;
        } catch (error) {
            console.error("Erreur lors de la création du tag:", error);
            return null;
        }
    };

    // Ajouter un tag à la liste
    const addTag = async (tagName: string) => {
        const trimmedTag = tagName.trim().toLowerCase();

        if (!trimmedTag) return;
        if (value.includes(trimmedTag)) return;
        if (value.length >= maxTags) return;

        // Vérifier si le tag existe déjà
        let tag: TagData | null | undefined = tags.find(tag => tag.name === trimmedTag);

        // Si le tag n'existe pas, le créer
        if (!tag) {
            tag = await createNewTag(trimmedTag);
            if (!tag) return;
        }

        // Ajouter à la liste des tags sélectionnés
        const newTags = [...value, trimmedTag];
        onChange(newTags);
        setInputValue(""); // Vider l'input
    };

    // Supprimer un tag
    const removeTag = (tagToRemove: string) => {
        const newTags = value.filter(tag => tag !== tagToRemove);
        onChange(newTags);
    };

    // Obtenir la couleur du chip selon la catégorie
    const getChipColor = (tagName: string) => {
        const existingTag = tags.find(tag => tag.name === tagName);
        if (existingTag) {
            switch (existingTag.category) {
                case "cuisine":
                    return "primary";
                case "regime":
                    return "success";
                case "difficulte":
                    return "warning";
                case "temps":
                    return "secondary";
                case "occasion":
                    return "danger";
                default:
                    return "default";
            }
        }
        return "default";
    };

    return (
        <div className={`space-y-3 ${className}`}>

            {/* Chips des tags sélectionnés */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-content2 rounded-lg border-2 border-divider min-h-12">
                    {value.map((tag, index) => (
                        <Chip
                            key={`${tag}-${index}`}
                            variant="flat"
                            color={getChipColor(tag)}
                            size="sm"
                            startContent={<Tag className="w-3 h-3" />}
                            onClose={() => removeTag(tag)}
                            className="cursor-default"
                        >
                            #{tag}
                        </Chip>
                    ))}
                </div>
            )}

            {/* Autocomplete pour rechercher/ajouter des tags */}
            <Autocomplete
                items={tags}
                label={label}
                placeholder={placeholder}
                startContent={<Tag className="w-4 h-4 text-default-400" />}
                isLoading={loading}
                allowsCustomValue
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSelectionChange={(key) => {
                    if (key) {
                        // Trouver le tag sélectionné
                        const selectedTag = tags.find(tag => tag.id === key);
                        if (selectedTag) {
                            addTag(selectedTag.name);
                        }
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                        e.preventDefault();
                        addTag(inputValue);
                    }
                }}
                isDisabled={value.length >= maxTags}
            >
                {(tag) => (
                    <AutocompleteItem key={tag.id} textValue={tag.name}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="w-3 h-3 text-default-400" />
                                <span>#{tag.name}</span>
                            </div>
                            <Chip size="sm" variant="dot" color={getChipColor(tag.name)}>
                                {tag.category}
                            </Chip>
                        </div>
                    </AutocompleteItem>
                )}
            </Autocomplete>

            {/* Description et compteur */}
            <div className="flex items-center justify-between text-xs text-default-500">
                <span>{description}</span>
                <span className={value.length >= maxTags ? "text-warning" : ""}>
                    {value.length}/{maxTags} tags
                </span>
            </div>

            {/* Tags populaires (suggestions rapides) */}
            {value.length === 0 && !loading && tags.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-default-500">Tags populaires :</p>
                    <div className="flex flex-wrap gap-1">
                        {tags
                            .slice(0, 6)
                            .map((tag) => (
                                <Button
                                    key={tag.id}
                                    size="sm"
                                    variant="bordered"
                                    startContent={<Plus className="w-3 h-3" />}
                                    onPress={() => addTag(tag.name)}
                                    className="h-6 px-2 text-xs"
                                    isDisabled={value.includes(tag.name)}
                                >
                                    #{tag.name}
                                </Button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}