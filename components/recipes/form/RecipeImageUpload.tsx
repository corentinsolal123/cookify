// components/recipes/edit/RecipeImageUpload.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface RecipeImageUploadProps {
    currentImage?: string;
    recipeName: string;
    onChange: (imageUrl: string) => void;
}

export default function RecipeImageUpload({
                                              currentImage,
                                              recipeName,
                                              onChange
                                          }: RecipeImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fonction pour valider le fichier
    const validateFile = (file: File): string | null => {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            return 'Le fichier doit être une image';
        }

        // Vérifier les formats acceptés
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return 'Format accepté : JPEG, PNG ou WebP';
        }

        // Vérifier la taille (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return 'L\'image doit faire moins de 10MB';
        }

        return null;
    };

    // Fonction pour redimensionner une image
    const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, quality: number = 0.8): Promise<File> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const img = new Image();

            img.onload = () => {
                // Calculer les nouvelles dimensions en gardant le ratio
                let { width, height } = img;

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

                canvas.width = width;
                canvas.height = height;

                // Dessiner l'image redimensionnée
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(resizedFile);
                        } else {
                            resolve(file); // Fallback sur le fichier original
                        }
                    },
                    file.type,
                    quality
                );
            };

            img.src = URL.createObjectURL(file);
        });
    };

    // Fonction d'upload vers le serveur
    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('recipeName', recipeName);

        const response = await fetch('/api/upload/recipe-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'upload');
        }

        const data = await response.json();
        return data.imageUrl;
    };

    // Fonction principale de traitement du fichier
    const handleFile = useCallback(async (file: File) => {
        setError(null);

        // Validation
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setUploading(true);

        try {
            // Prévisualisation immédiate
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);

            // Redimensionnement si nécessaire
            const resizedFile = await resizeImage(file);

            // Upload vers le serveur
            const imageUrl = await uploadFile(resizedFile);

            // Mettre à jour la recette
            onChange(imageUrl);

            // Nettoyer l'URL de prévisualisation
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(imageUrl);

        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            setError('Erreur lors de l\'upload de l\'image');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    }, [recipeName, onChange]);

    // Gestion du drag & drop
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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    // Gestion du clic sur input file
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // Supprimer l'image
    const removeImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onChange('');
        setError(null);

        // Réinitialiser l'input file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
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
                        accept="image/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
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
                                JPEG, PNG ou WebP • Max 10MB
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* Prévisualisation de l'image */
                <div className="relative">
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
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
                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            Changer l'image
                        </button>

                        <button
                            onClick={removeImage}
                            disabled={uploading}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Supprimer
                        </button>
                    </div>

                    {/* Input caché pour le changement */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={uploading}
                    />
                </div>
            )}

            {/* Erreurs */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
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
        </div>
    );
}