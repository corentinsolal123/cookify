// app/api/upload/recipe-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'recipes');

// Fonction pour créer le dossier d'upload s'il n'existe pas
async function ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }
}

// Fonction pour nettoyer le nom de fichier
function sanitizeFileName(fileName: string): string {
    return fileName
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
}

// Fonction pour générer un nom de fichier unique
function generateUniqueFileName(originalName: string, recipeName: string): string {
    const ext = path.extname(originalName);
    const sanitizedRecipeName = sanitizeFileName(recipeName);
    const uniqueId = uuidv4().split('-')[0]; // Utiliser seulement les 8 premiers caractères
    const timestamp = Date.now();

    return `${sanitizedRecipeName}_${timestamp}_${uniqueId}${ext}`;
}

// Alternative : Upload vers Cloudinary (si configuré)
async function uploadToCloudinary(buffer: Buffer, fileName: string): Promise<string> {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (!cloudinaryUrl) {
        throw new Error('Cloudinary non configuré');
    }

    // Configuration Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Variables Cloudinary manquantes');
    }

    try {
        // Conversion du buffer en base64
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        // Requête vers Cloudinary
        const formData = new FormData();
        formData.append('file', base64Image);
        formData.append('upload_preset', 'recipe_images'); // Preset à configurer dans Cloudinary
        formData.append('folder', 'cookify/recipes');
        formData.append('public_id', path.parse(fileName).name);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Erreur Cloudinary');
        }

        const result = await response.json();
        return result.secure_url;

    } catch (error) {
        console.error('Erreur Cloudinary:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const recipeName = formData.get('recipeName') as string;

        // Validation des données reçues
        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        if (!recipeName) {
            return NextResponse.json(
                { error: 'Nom de recette requis' },
                { status: 400 }
            );
        }

        // Validation du fichier
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'Fichier trop volumineux (max 10MB)' },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Type de fichier non supporté. Utilisez JPEG, PNG ou WebP' },
                { status: 400 }
            );
        }

        // Conversion du fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Génération du nom de fichier unique
        const uniqueFileName = generateUniqueFileName(file.name, recipeName);

        // Option 1: Upload local (par défaut)
        if (!process.env.CLOUDINARY_URL) {
            await ensureUploadDir();

            const filePath = path.join(UPLOAD_DIR, uniqueFileName);
            await writeFile(filePath, buffer);

            // URL accessible publiquement
            const imageUrl = `/uploads/recipes/${uniqueFileName}`;

            return NextResponse.json({
                success: true,
                imageUrl,
                fileName: uniqueFileName,
                size: file.size,
                type: file.type
            });
        }

        // Option 2: Upload vers Cloudinary
        try {
            const cloudinaryUrl = await uploadToCloudinary(buffer, uniqueFileName);

            return NextResponse.json({
                success: true,
                imageUrl: cloudinaryUrl,
                fileName: uniqueFileName,
                size: file.size,
                type: file.type,
                provider: 'cloudinary'
            });

        } catch (cloudinaryError) {
            console.error('Erreur Cloudinary, fallback vers upload local:', cloudinaryError);

            // Fallback vers upload local
            await ensureUploadDir();
            const filePath = path.join(UPLOAD_DIR, uniqueFileName);
            await writeFile(filePath, buffer);

            const imageUrl = `/uploads/recipes/${uniqueFileName}`;

            return NextResponse.json({
                success: true,
                imageUrl,
                fileName: uniqueFileName,
                size: file.size,
                type: file.type,
                provider: 'local'
            });
        }

    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);

        return NextResponse.json(
            {
                error: 'Erreur serveur lors de l\'upload',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}

// Endpoint pour supprimer une image
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'URL d\'image requise' },
                { status: 400 }
            );
        }

        // Si c'est une URL Cloudinary, on pourrait implémenter la suppression
        if (imageUrl.includes('cloudinary.com')) {
            // Implémentation de la suppression Cloudinary (optionnel)
            return NextResponse.json({
                success: true,
                message: 'Image Cloudinary - suppression non implémentée'
            });
        }

        // Suppression locale
        if (imageUrl.startsWith('/uploads/recipes/')) {
            const fileName = path.basename(imageUrl);
            const filePath = path.join(UPLOAD_DIR, fileName);

            try {
                const { unlink } = await import('fs/promises');
                await unlink(filePath);

                return NextResponse.json({
                    success: true,
                    message: 'Image supprimée avec succès'
                });

            } catch (error) {
                return NextResponse.json(
                    { error: 'Erreur lors de la suppression du fichier' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { error: 'URL d\'image invalide' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Erreur lors de la suppression:', error);

        return NextResponse.json(
            { error: 'Erreur serveur lors de la suppression' },
            { status: 500 }
        );
    }
}

// Endpoint pour obtenir des informations sur une image
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'URL d\'image requise' },
                { status: 400 }
            );
        }

        // Informations de base
        const imageInfo = {
            url: imageUrl,
            exists: false,
            provider: imageUrl.includes('cloudinary.com') ? 'cloudinary' : 'local',
            timestamp: null as number | null
        };

        // Vérification pour les images locales
        if (imageUrl.startsWith('/uploads/recipes/')) {
            const fileName = path.basename(imageUrl);
            const filePath = path.join(UPLOAD_DIR, fileName);

            try {
                const { stat } = await import('fs/promises');
                const stats = await stat(filePath);

                imageInfo.exists = true;
                imageInfo.timestamp = stats.mtime.getTime();

            } catch (error) {
                imageInfo.exists = false;
            }
        } else if (imageUrl.includes('cloudinary.com')) {
            // Pour Cloudinary, on suppose que l'image existe
            imageInfo.exists = true;
        }

        return NextResponse.json(imageInfo);

    } catch (error) {
        console.error('Erreur lors de la récupération des infos image:', error);

        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}