// components/recipes/SearchAndFilters.tsx - NOUVEAU composant
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Slider } from "@heroui/slider";
import { Card, CardBody } from "@heroui/card";
import { TagData } from "@/types/tag";
import { SearchFilters } from "@/types/search";
import { TAG_COLORS, TAG_CATEGORIES } from "@/lib/tagHelpers";

interface SearchAndFiltersProps {
    allTags: TagData[];
    currentFilters: SearchFilters;
    totalResults: number;
}

export function SearchAndFilters({ allTags, currentFilters, totalResults }: SearchAndFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentFilters.search || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);
    const [difficulty, setDifficulty] = useState(currentFilters.difficulty || '');
    const [maxPrepTime, setMaxPrepTime] = useState(currentFilters.maxPrepTime || 120);
    const [showFilters, setShowFilters] = useState(false);

    // Debounce pour la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateFilters({ search });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const updateFilters = (newFilters: Partial<SearchFilters>) => {
        const params = new URLSearchParams(searchParams);

        // Update search
        if (newFilters.search !== undefined) {
            if (newFilters.search) {
                params.set('search', newFilters.search);
            } else {
                params.delete('search');
            }
        }

        // Update tags
        if (newFilters.tags !== undefined) {
            if (newFilters.tags.length > 0) {
                params.set('tags', newFilters.tags.join(','));
            } else {
                params.delete('tags');
            }
        }

        // Update difficulty
        if (newFilters.difficulty !== undefined) {
            if (newFilters.difficulty) {
                params.set('difficulty', newFilters.difficulty);
            } else {
                params.delete('difficulty');
            }
        }

        // Update prep time
        if (newFilters.maxPrepTime !== undefined) {
            if (newFilters.maxPrepTime < 120) {
                params.set('maxPrepTime', newFilters.maxPrepTime.toString());
            } else {
                params.delete('maxPrepTime');
            }
        }

        // Reset page to 1 when filters change
        params.delete('page');

        router.push(`/recipes?${params.toString()}`);
    };

    const toggleTag = (tagSlug: string) => {
        const newTags = selectedTags.includes(tagSlug)
            ? selectedTags.filter(t => t !== tagSlug)
            : [...selectedTags, tagSlug];

        setSelectedTags(newTags);
        updateFilters({ tags: newTags });
    };

    const clearAllFilters = () => {
        setSearch('');
        setSelectedTags([]);
        setDifficulty('');
        setMaxPrepTime(120);
        router.push('/recipes');
    };

    const hasActiveFilters = search || selectedTags.length > 0 || difficulty || maxPrepTime < 120;

    // Grouper les tags par catégorie
    const tagsByCategory = allTags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
            acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
    }, {} as Record<string, TagData[]>);

    return (
        <div className="space-y-6">
            {/* Barre de recherche principale */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        type="search"
                        placeholder="Rechercher une recette..."
                        size="lg"
                        radius="lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                        classNames={{
                            inputWrapper: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                            input: "text-base"
                        }}
                    />
                </div>

                <Button
                    variant={showFilters ? "solid" : "flat"}
                    color="primary"
                    size="lg"
                    onPress={() => setShowFilters(!showFilters)}
                    startContent={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    }
                >
                    Filtres {hasActiveFilters && `(${[search, ...selectedTags, difficulty, maxPrepTime < 120].filter(Boolean).length})`}
                </Button>
            </div>

            {/* Résumé des résultats */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
                </p>

                {hasActiveFilters && (
                    <Button
                        size="sm"
                        variant="flat"
                        color="default"
                        onPress={clearAllFilters}
                    >
                        Effacer les filtres
                    </Button>
                )}
            </div>

            {/* Panel des filtres */}
            {showFilters && (
                <Card>
                    <CardBody className="p-6 space-y-6">
                        {/* Tags par catégorie */}
                        {Object.entries(tagsByCategory).map(([category, tags]) => (
                            <div key={category}>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span>{TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]?.icon}</span>
                                    {TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]?.label}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Chip
                                            key={tag.slug}
                                            variant={selectedTags.includes(tag.slug) ? "solid" : "flat"}
                                            color={selectedTags.includes(tag.slug) ? "primary" : "default"}
                                            className={`cursor-pointer transition-all ${!selectedTags.includes(tag.slug) ? TAG_COLORS[tag.color as keyof typeof TAG_COLORS] : ''}`}
                                            onClick={() => toggleTag(tag.slug)}
                                        >
                                            {tag.name}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Autres filtres */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Difficulté
                                </label>
                                <Select
                                    placeholder="Toutes les difficultés"
                                    selectedKeys={difficulty ? [difficulty] : []}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setDifficulty(selected || '');
                                        updateFilters({ difficulty: selected || '' });
                                    }}
                                >
                                    <SelectItem key="Facile">Facile</SelectItem>
                                    <SelectItem key="Moyen">Moyen</SelectItem>
                                    <SelectItem key="Difficile">Difficile</SelectItem>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Temps de préparation max: {maxPrepTime >= 120 ? '2h+' : `${maxPrepTime}min`}
                                </label>
                                <Slider
                                    size="sm"
                                    step={15}
                                    minValue={15}
                                    maxValue={120}
                                    value={maxPrepTime}
                                    onChange={(value) => {
                                        const newValue = Array.isArray(value) ? value[0] : value;
                                        setMaxPrepTime(newValue);
                                    }}
                                    onChangeEnd={(value) => {
                                        const newValue = Array.isArray(value) ? value[0] : value;
                                        updateFilters({ maxPrepTime: newValue });
                                    }}
                                    className="max-w-md"
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}