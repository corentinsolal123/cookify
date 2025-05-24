// components/recipes/SearchInput.tsx (Client Component)
"use client";

import { Input } from "@heroui/input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");

    const handleSearch = (value: string) => {
        setSearch(value);

        // Debounce la recherche
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set("search", value);
            } else {
                params.delete("search");
            }
            router.push(`/recipes?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    return (
        <Input
            type="search"
            placeholder="Rechercher une recette..."
            size="sm"
            radius="lg"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            startContent={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            }
            className="w-full sm:w-64"
            classNames={{
                inputWrapper: "bg-gray-100 dark:bg-gray-700 border-0",
                input: "text-sm"
            }}
        />
    );
}