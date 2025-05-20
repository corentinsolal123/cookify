"use client";

import { Button, Divider, Link, Input } from "@heroui/react";
import NextLink from "next/link";

interface RecipePageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function RecipePageHeader({ title, subtitle }: RecipePageHeaderProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-8 pb-6">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <Input
                            type="search"
                            placeholder="Rechercher une recette..."
                            size="sm"
                            radius="lg"
                            startContent={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                            className="w-full sm:w-64"
                            classNames={{
                                inputWrapper: "bg-gray-100 dark:bg-gray-700 border-0",
                                input: "text-sm"
                            }}
                        />
                        <Button
                            as={NextLink}
                            href="/recipes/edit/new"
                            color="primary"
                            variant="solid"
                            radius="full"
                            startContent={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            }
                        >
                            Créer une recette
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
