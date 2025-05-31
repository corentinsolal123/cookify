// components/recipes/edit/RecipeImageUpload.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import NextImage from 'next/image'; // ✅ Import renommé pour éviter les conflits
import { Card } from "@heroui/card";

interface RecipeImageUploadProps {
    currentImage?: string;
    recipeName: string;
    onChange: (imageUrl: string) => void;
}

// ✅ Types pour une meilleure robustesse
interface ImageDimensions {
    width: number;
    height: number;
}

interface ResizeOptions {
    maxWidth: number;
    maxHeight: number;
    quality: number;
}

export default function RecipeImageUpload({
                                              currentImage,
                                              recipeName,
                                              onChange
                                          }: Readonly<RecipeImageUploadProps>) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ✅ Configuration centralisée
    const UPLOAD_CONFIG = {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        resizeOptions: {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8
        } as ResizeOptions
    } as const;

    // ✅ Validation avec messages d'erreur plus précis
    const validateFile = (file: File): string | null => {
        if (!file.type.startsWith('image/')) {
            return 'Le fichier doit être une image';
        }

        // Vérifier les formats acceptés
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return 'Format accepté : JPEG, PNG ou WebP';
        }

        if (file.size > UPLOAD_CONFIG.maxSize) {
            const maxSizeMB = UPLOAD_CONFIG.maxSize / (1024 * 1024);
            return `L'image doit faire moins de ${maxSizeMB}MB (taille actuelle: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
        }

        return null;
    };

    // ✅ Fonction utilitaire pour calculer les dimensions
    const calculateNewDimensions = (
        original: ImageDimensions,
        max: Pick<ResizeOptions, 'maxWidth' | 'maxHeight'>
    ): ImageDimensions => {
        let { width, height } = original;
        const { maxWidth, maxHeight } = max;

        // Garde le ratio d'aspect
        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }

        return { width, height };
    };

    // ✅ Fonction de redimensionnement robuste avec gestion d'erreur complète
    const resizeImage = (file: File, options: ResizeOptions = UPLOAD_CONFIG.resizeOptions): Promise<File> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Impossible de créer le contexte canvas'));
                return;
            }

            const img = new HTMLImageElement(); // ✅ Explicite et sans conflit
            let objectUrl: string | null = null;

            // ✅ Nettoyage automatique des ressources
            const cleanup = () => {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                    objectUrl = null;
                }
            };

            img.onload = () => {
                try {
                    // Calculer les nouvelles dimensions
                    const newDimensions = calculateNewDimensions(
                        { width: img.naturalWidth, height: img.naturalHeight },
                        { maxWidth: options.maxWidth, maxHeight: options.maxHeight }
                    );

                    canvas.width = newDimensions.width;
                    canvas.height = newDimensions.height;

                    // Dessiner l'image redimensionnée
                    ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);

                    // Convertir en blob avec gestion d'erreur
                    canvas.toBlob(
                        (blob) => {
                            cleanup();

                            if (!blob) {
                                reject(new Error('Impossible de redimensionner l\'image'));
                                return;
                            }

                            const resizedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });

                            resolve(resizedFile);
                        },
                        file.type,
                        options.quality
                    );
                } catch (error) {
                    cleanup();
                    reject(new Error('Erreur lors du redimensionnement'));
                }
            };

            img.onerror = () => {
                cleanup();
                reject(new Error('Impossible de charger l\'image pour le redimensionnement'));
            };

            // ✅ Créer l'URL et la nettoyer automatiquement
            objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
        });
    };

    // ✅ Upload avec retry logic et meilleure gestion d'erreur
    const uploadFile = async (file: File, retries: number = 2): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('recipeName', recipeName);

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch('/api/upload/recipe-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
                }

                const data = await response.json();

                if (!data.imageUrl) {
                    throw new Error('URL d\'image manquante dans la réponse');
                }

                return data.imageUrl;
            } catch (error) {
                if (attempt === retries) {
                    throw error; // Dernière tentative échouée
                }
                // Attendre avant de retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }

        throw new Error('Échec après plusieurs tentatives');
    };

    // ✅ Fonction principale avec meilleure gestion des états
    const handleFile = useCallback(async (file: File) => {
        setError(null);

        // Validation
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploading(true);
        let tempPreviewUrl: string | null = null;

        try {
            // Prévisualisation immédiate
            tempPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(tempPreviewUrl);

            // Redimensionnement si nécessaire
            const resizedFile = await resizeImage(file);

            // Upload vers le serveur
            const imageUrl = await uploadFile(resizedFile);

            // Succès : mettre à jour avec l'URL finale
            onChange(imageUrl);

            // Nettoyer l'URL temporaire et utiliser l'URL finale
            if (tempPreviewUrl) {
                URL.revokeObjectURL(tempPreviewUrl);
                tempPreviewUrl = null;
            }
            setPreviewUrl(imageUrl);

        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);

            // Nettoyer en cas d'erreur
            if (tempPreviewUrl) {
                URL.revokeObjectURL(tempPreviewUrl);
            }
            setPreviewUrl(currentImage || null);

            // Message d'erreur adapté
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Erreur inattendue lors de l\'upload');
            }
        } finally {
            setUploading(false);
        }
    }, [recipeName, onChange, currentImage]);

    // ✅ Gestion du drag & drop optimisée
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    // ✅ Gestion du clic sur input file
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    // ✅ Supprimer l'image avec nettoyage complet
    const removeImage = useCallback(() => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onChange('');
        setError(null);

        // Réinitialiser l'input file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [previewUrl, onChange]);

    return (
        <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                Photo de la recette
            </h3>

            {/* Zone d'upload */}
            {!previewUrl ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={UPLOAD_CONFIG.allowedTypes.join(',')}
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                        aria-label="Sélectionner une image"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-600">Upload en cours...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">
                                Glisse ton image ici ou{' '}
                                <span className="text-blue-600 font-medium">clique pour choisir</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                JPEG, PNG ou WebP • Max {UPLOAD_CONFIG.maxSize / (1024 * 1024)}MB
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* Prévisualisation de l'image */
                <div className="relative">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <NextImage
                            src={previewUrl}
                            alt={`Photo de ${recipeName}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />

                        {/* Overlay de chargement */}
                        {uploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                            aria-label="Changer l'image"
                        >
                            <Upload className="w-4 h-4" />
                            Changer l'image
                        </button>

                        <button
                            onClick={removeImage}
                            disabled={uploading}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                            aria-label="Supprimer l'image"
                        >
                            <X className="w-4 h-4" />
                            Supprimer
                        </button>
                    </div>

                    {/* Input caché pour le changement */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={UPLOAD_CONFIG.allowedTypes.join(',')}
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={uploading}
                        aria-label="Changer l'image"
                    />
                </div>
            )}

            {/* Erreurs */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2" role="alert">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Conseils */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Conseils pour une belle photo</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Utilise un bon éclairage naturel</li>
                    <li>• Cadre bien ton plat</li>
                    <li>• Évite les reflets et les ombres</li>
                    <li>• Montre la texture et les couleurs</li>
                </ul>
            </div>
        </Card>
    );
}