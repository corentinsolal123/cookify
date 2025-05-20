"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, CardFooter, Input, Link, Divider } from "@heroui/react";
import NextLink from "next/link";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false // Gestion locale des erreurs
            });

            if (res?.error) {
                setError("Nom d'utilisateur ou mot de passe invalide");
            }
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-8">
            <Card 
                isBlurred 
                className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700"
            >
                <CardHeader className="flex flex-col gap-1 items-center pt-8 pb-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Bienvenue sur Cookify
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        Connectez-vous pour accéder à vos recettes
                    </p>
                </CardHeader>
                <CardBody className="px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Nom d'utilisateur"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            required
                        />
                        <Input
                            label="Mot de passe"

                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            required
                        />
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                        <Button 
                            type="submit" 
                            color="primary"
                            className="w-full font-medium"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Se connecter
                        </Button>
                    </form>
                </CardBody>
                <Divider className="bg-gray-200 dark:bg-gray-700" />
                <CardFooter className="flex flex-col gap-3 px-8 py-5">
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                        Vous n'avez pas encore de compte ?
                    </p>
                    <Button 
                        as={NextLink}
                        href="/register" 
                        variant="flat" 
                        color="secondary"
                        className="w-full font-medium"
                    >
                        Créer un compte
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
