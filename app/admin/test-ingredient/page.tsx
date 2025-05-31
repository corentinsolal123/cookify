// app/debug-ingredients/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { useNutrition } from '@/lib/hooks/useNutrition';

export default function DebugIngredientsPage() {
    const [manualSearch, setManualSearch] = useState("");

    const {
        suggestions,
        isLoading,
        setSearchTerm,
        isUsingLocalData,
        resetLocalData,
        debug
    } = useNutrition();

    const handleSearch = () => {
        setSearchTerm(manualSearch);
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">🐛 Debug - Recherche d'ingrédients</h1>
                <p className="text-default-600">
                    Teste la recherche d'ingrédients avec informations de debug
                </p>
            </div>

            {/* Contrôles de test */}
            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Contrôles de test</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            value={manualSearch}
                            onChange={(e) => setManualSearch(e.target.value)}
                            placeholder="Tapez votre recherche ici..."
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <Button onPress={handleSearch} color="primary">
                            Rechercher
                        </Button>
                    </div>

                    {/* Tests rapides */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Tests rapides :</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'pulpe de tomate',
                                'farine',
                                'nutella',
                                'tomate',
                                'pulpe',
                                'inexistant123'
                            ].map(term => (
                                <Button
                                    key={term}
                                    size="sm"
                                    variant="bordered"
                                    onPress={() => {
                                        setManualSearch(term);
                                        setSearchTerm(term);
                                    }}
                                >
                                    {term}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Status de l'API */}
                    <div className="flex items-center gap-4">
                        <Chip
                            color={isUsingLocalData ? "warning" : "success"}
                            variant="flat"
                        >
                            {isUsingLocalData ? "Mode Local" : "API Active"}
                        </Chip>

                        {isLoading && (
                            <Chip color="primary" variant="flat">
                                Chargement...
                            </Chip>
                        )}

                        {isUsingLocalData && (
                            <Button size="sm" onPress={resetLocalData} variant="light">
                                Réessayer API
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Informations de debug */}
            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Informations de debug</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="font-medium">Terme recherché</div>
                            <div className="text-default-600">
                                {debug.searchTerm || 'Aucun'}
                            </div>
                        </div>

                        <div>
                            <div className="font-medium">Résultats locaux</div>
                            <div className="text-success font-bold">
                                {debug.localResults}
                            </div>
                        </div>

                        <div>
                            <div className="font-medium">Résultats API</div>
                            <div className="text-primary font-bold">
                                {debug.apiResults}
                            </div>
                        </div>

                        <div>
                            <div className="font-medium">Total combiné</div>
                            <div className="text-secondary font-bold">
                                {debug.combinedResults}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Résultats de recherche */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">
                        Résultats ({suggestions.length})
                    </h2>
                </CardHeader>
                <CardBody>
                    {suggestions.length === 0 ? (
                        <div className="text-center py-8 text-default-500">
                            {debug.searchTerm ? 'Aucun résultat trouvé' : 'Tapez une recherche pour voir les résultats'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <Card key={suggestion.id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{suggestion.name}</div>
                                            <div className="text-sm text-default-600">
                                                {suggestion.calories} cal/100g •
                                                P: {suggestion.proteins}g •
                                                G: {suggestion.carbs}g •
                                                L: {suggestion.fat}g •
                                                F: {suggestion.fiber}g
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Chip
                                                size="sm"
                                                color={
                                                    suggestion.source === 'local' ? 'primary' :
                                                        suggestion.source === 'openfoodfacts' ? 'success' : 'default'
                                                }
                                                variant="flat"
                                            >
                                                {suggestion.source === 'local' ? 'Base Cookify' :
                                                    suggestion.source === 'openfoodfacts' ? 'OpenFoodFacts' : 'Manuel'}
                                            </Chip>

                                            <span className="text-xs text-default-400">
                        #{index + 1}
                      </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Guide de test */}
            <Card className="mt-6">
                <CardHeader>
                    <h3 className="text-lg font-semibold">Guide de test</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4 text-sm">
                        <div>
                            <strong>✅ Ingrédients qui devraient fonctionner :</strong>
                            <div className="mt-2 space-y-1">
                                <div>• <code>pulpe de tomate</code> → Devrait trouver "Pulpe de tomate" (Base Cookify)</div>
                                <div>• <code>farine</code> → Devrait trouver "Farine de blé" (Base Cookify)</div>
                                <div>• <code>tomate</code> → Devrait trouver "Tomates" + "Pulpe de tomate" + "Concentré de tomate"</div>
                                <div>• <code>pulpe</code> → Devrait trouver "Pulpe de tomate"</div>
                            </div>
                        </div>

                        <div>
                            <strong>🔍 Recherche flexible :</strong>
                            <div className="mt-2 space-y-1">
                                <div>• Recherche exacte : <code>tomates</code></div>
                                <div>• Recherche partielle : <code>tom</code> trouve "tomates"</div>
                                <div>• Recherche par mots-clés : <code>pulpe</code> trouve "pulpe de tomate"</div>
                            </div>
                        </div>

                        <div>
                            <strong>🚨 Tests d'erreur :</strong>
                            <div className="mt-2 space-y-1">
                                <div>• <code>inexistant123</code> → Devrait ne rien trouver mais permettre l'ajout manuel</div>
                                <div>• Mode local forcé si OpenFoodFacts ne répond pas</div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}