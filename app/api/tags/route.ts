// app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllTagsServer } from '@/lib/services/server/tagServices';
import { createTag } from '@/lib/services/client/tagServices';

// GET - Récupérer tous les tags
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Récupération via le service Supabase serveur
        let tags = await getAllTagsServer();

        // Filtrage par catégorie si spécifié
        if (category) {
            tags = tags.filter(tag => tag.category === category);
        }

        // Filtrage par recherche si spécifié
        if (search) {
            const searchLower = search.toLowerCase();
            tags = tags.filter(tag =>
                tag.name.toLowerCase().includes(searchLower)
            );
        }

        // Trier par popularité (ou ordre alphabétique)
        tags.sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json(tags);

    } catch (error) {
        console.error('Erreur lors de la récupération des tags:', error);

        return NextResponse.json(
            {
                error: 'Erreur lors de la récupération des tags',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// POST - Créer un nouveau tag
export async function POST(request: NextRequest) {
    try {
        const { name, category = 'general', color = '#3b82f6' } = await request.json();

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Le nom du tag est requis' },
                { status: 400 }
            );
        }

        // Générer un slug à partir du nom
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Enlever les caractères spéciaux
            .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
            .replace(/-+/g, '-'); // Fusionner les tirets multiples

        // Créer le tag via le service Supabase
        const newTag = await createTag({
            name: name.trim().toLowerCase(),
            slug,
            color,
            category: category as any
        });

        return NextResponse.json(newTag, { status: 201 });

    } catch (error) {
        console.error('Erreur lors de la création du tag:', error);

        // Gérer l'erreur de duplication (si le tag existe déjà)
        if (error instanceof Error && error.message.includes('duplicate')) {
            return NextResponse.json(
                { error: 'Ce tag existe déjà' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error: 'Erreur lors de la création du tag',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// GET - Récupérer les tags par catégorie (endpoint alternatif)
export async function getTagsByCategory(category: string) {
    try {
        const tags = await getAllTagsServer();
        return tags.filter(tag => tag.category === category);
    } catch (error) {
        console.error(`Erreur lors de la récupération des tags ${category}:`, error);
        return [];
    }
}