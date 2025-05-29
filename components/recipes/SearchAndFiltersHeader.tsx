// components/recipes/SearchAndFiltersHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Slider } from "@heroui/slider";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { TagData } from "@/types/tag";
import { SearchFilters } from "@/types/search";
import { TAG_COLORS, TAG_CATEGORIES } from "@/lib/tagHelpers";

interface SearchAndFiltersHeaderProps {
    allTags: TagData[];
    currentFilters: SearchFilters;
    totalResults: number;
}

export function SearchAndFiltersHeader({ allTags, currentFilters, totalResults }: SearchAndFiltersHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(currentFilters.search || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);
    const [difficulty, setDifficulty] = useState(currentFilters.difficulty || '');
    const [maxPrepTime, setMaxPrepTime] = useState(currentFilters.maxPrepTime || 120);

    // Debounce pour la recherche
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateFilters({ search });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const updateFilters = (newFilters: Partial<SearchFilters>) => {
        const params = new URLSearchParams(searchParams);

        if (newFilters.search !== undefined) {
            if (newFilters.search) {
                params.set('search', newFilters.search);
            } else {
                params.delete('search');
            }
        }

        if (newFilters.tags !== undefined) {
            if (newFilters.tags.length > 0) {
                params.set('tags', newFilters.tags.join(','));
            } else {
                params.delete('tags');
            }
        }

        if (newFilters.difficulty !== undefined) {
            if (newFilters.difficulty) {
                params.set('difficulty', newFilters.difficulty);
            } else {
                params.delete('difficulty');
            }
        }

        if (newFilters.maxPrepTime !== undefined) {
            if (newFilters.maxPrepTime < 120) {
                params.set('maxPrepTime', newFilters.maxPrepTime.toString());
            } else {
                params.delete('maxPrepTime');
            }
        }

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
    const activeFiltersCount = [search, ...selectedTags, difficulty, maxPrepTime < 120].filter(Boolean).length;

    // Grouper les tags par catégorie
    const tagsByCategory = allTags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
            acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
    }, {} as Record<string, TagData[]>);

    return (
        <div className="space-y-4">
            {/* Ligne principale : recherche + filtres + stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Barre de recherche */}
                <div className="flex-1 max-w-md">
                    <Input
                        type="search"
                        placeholder="Rechercher une recette..."
                        size="sm"
                        radius="lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                        classNames={{
                            inputWrapper: "bg-gray-100 dark:bg-gray-700 border-0",
                            input: "text-sm"
                        }}
                    />
                </div>

                {/* Boutons de filtres */}
                <div className="flex items-center gap-2">
                    {/* Popover des filtres avancés */}
                    <Popover placement="bottom-end">
                        <PopoverTrigger>
                            <Button
                                variant="flat"
                                color={hasActiveFilters ? "primary" : "default"}
                                size="sm"
                                startContent={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                }
                            >
                                Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-0">
                            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                                {/* Tags par catégorie */}
                                {Object.entries(tagsByCategory).map(([category, tags]) => (
                                    <div key={category}>
                                        <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                            <span>{TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]?.icon}</span>
                                            {TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES]?.label}
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                            {tags.map((tag) => (
                                                <Chip
                                                    key={tag.slug}
                                                    size="sm"
                                                    variant={selectedTags.includes(tag.slug) ? "solid" : "flat"}
                                                    color={selectedTags.includes(tag.slug) ? "primary" : "default"}
                                                    className={`cursor-pointer text-xs ${!selectedTags.includes(tag.slug) ? TAG_COLORS[tag.color as keyof typeof TAG_COLORS] : ''}`}
                                                    onClick={() => toggleTag(tag.slug)}
                                                >
                                                    {tag.name}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Difficulté */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulté
                                    </label>
                                    <Select
                                        size="sm"
                                        placeholder="Toutes"
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

                                {/* Temps de préparation */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Temps max: {maxPrepTime >= 120 ? '2h+' : `${maxPrepTime}min`}
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
                                    />
                                </div>

                                {/* Bouton reset */}
                                {hasActiveFilters && (
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        color="default"
                                        className="w-full"
                                        onPress={clearAllFilters}
                                    >
                                        Effacer tous les filtres
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Stats des résultats */}
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {totalResults} résultat{totalResults > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Tags actifs (si sélectionnés) */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Filtré par:</span>
                    {selectedTags.map((tagSlug) => {
                        const tag = allTags.find(t => t.slug === tagSlug);
                        return tag ? (
                            <Chip
                                key={tagSlug}
                                size="sm"
                                variant="solid"
                                color="primary"
                                onClose={() => toggleTag(tagSlug)}
                            >
                                {tag.name}
                            </Chip>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}