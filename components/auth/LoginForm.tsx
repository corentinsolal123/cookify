"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
    const { signIn, signInWithProvider } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL de redirection après connexion (si spécifiée)
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleInputChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (field === "email") {
            setEmail(e.target.value);
        } else {
            setPassword(e.target.value);
        }
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { error: signInError } = await signIn(email, password);

            if (signInError) {
                // Gestion des différents types d'erreur Supabase
                switch (signInError.message) {
                    case "Invalid login credentials":
                        setError("Email ou mot de passe invalide");
                        break;
                    case "Email not confirmed":
                        setError("Veuillez confirmer votre email avant de vous connecter");
                        break;
                    case "Too many requests":
                        setError("Trop de tentatives de connexion. Veuillez réessayer plus tard");
                        break;
                    default:
                        setError(signInError.message || "Erreur de connexion");
                }
            } else {
                // Connexion réussie, redirection
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsGoogleLoading(true);

        try {
            const { error: googleError } = await signInWithProvider("google");

            if (googleError) {
                setError("Erreur lors de la connexion avec Google");
            }
            // Note: Avec Google OAuth, la redirection se fait automatiquement
        } catch (err) {
            setError("Une erreur est survenue avec Google. Veuillez réessayer.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setError(null);
        setIsAppleLoading(true);

        try {
            const { error: appleError } = await signInWithProvider("apple");

            if (appleError) {
                setError("Erreur lors de la connexion avec Apple");
            }
        } catch (err) {
            setError("Une erreur est survenue avec Apple. Veuillez réessayer.");
        } finally {
            setIsAppleLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
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
                            label="Email"
                            type="email"
                            value={email}
                            onChange={handleInputChange("email")}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            isDisabled={isLoading || isGoogleLoading || isAppleLoading}
                            autoComplete="email"
                            required
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={password}
                            onChange={handleInputChange("password")}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            isDisabled={isLoading || isGoogleLoading || isAppleLoading}
                            autoComplete="current-password"
                            required
                        />

                        {error && (
                            <div
                                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full font-medium"
                            size="lg"
                            isLoading={isLoading}
                            isDisabled={!email || !password || isGoogleLoading || isAppleLoading}
                        >
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </Button>

                        <Divider />

                        <Button
                            type="button"
                            variant="bordered"
                            className="w-full font-medium border-gray-300 dark:border-gray-600"
                            size="lg"
                            startContent={
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            }
                            onPress={handleGoogleSignIn}
                            isLoading={isGoogleLoading}
                            isDisabled={isLoading || isAppleLoading}
                        >
                            {isGoogleLoading ? "Connexion..." : "Continuer avec Google"}
                        </Button>

                        <Button
                            type="button"
                            variant="bordered"
                            className="w-full font-medium border-gray-300 dark:border-gray-600"
                            size="lg"
                            startContent={
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                                    />
                                </svg>
                            }
                            onPress={handleAppleSignIn}
                            isLoading={isAppleLoading}
                            isDisabled={isLoading || isGoogleLoading}
                        >
                            {isAppleLoading ? "Inscription..." : "Continuer avec Apple"}
                        </Button>
                    </form>
                </CardBody>
                <Divider className="bg-gray-200 dark:border-gray-700" />
                <CardFooter className="flex flex-col gap-3 px-8 py-5">
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                        Vous n'avez pas encore de compte ?
                    </p>
                    <Button
                        as={NextLink}
                        href="/auth/signup"
                        variant="flat"
                        color="secondary"
                        className="w-full font-medium"
                        isDisabled={isLoading || isGoogleLoading || isAppleLoading}
                    >
                        Créer un compte
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}