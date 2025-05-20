"use client";

import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, CardFooter, Input, Divider } from "@heroui/react";
import NextLink from "next/link";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            if (res.ok) {
                setMessage("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");
            } else {
                setMessage("❌ Erreur lors de l'inscription.");
            }
        } catch (err) {
            setMessage("❌ Une erreur est survenue. Veuillez réessayer.");
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
                        Créer un compte
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        Rejoignez Cookify pour partager et découvrir des recettes
                    </p>
                </CardHeader>
                <CardBody className="px-8 py-6">
                    <form onSubmit={handleRegister} className="space-y-5">
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
                            label="Email"

                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {message && (
                            <div className={`border rounded-lg p-3 ${
                                message.startsWith("✅") 
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            }`}>
                                <p className={`text-sm ${
                                    message.startsWith("✅") 
                                        ? "text-green-600 dark:text-green-400" 
                                        : "text-red-600 dark:text-red-400"
                                }`}>
                                    {message}
                                </p>
                            </div>
                        )}
                        <Button 
                            type="submit" 
                            color="primary"
                            className="w-full font-medium"
                            size="lg"
                            isLoading={isLoading}
                        >
                            S'inscrire
                        </Button>
                    </form>
                </CardBody>
                <Divider className="bg-gray-200 dark:bg-gray-700" />
                <CardFooter className="flex flex-col gap-3 px-8 py-5">
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                        Vous avez déjà un compte ?
                    </p>
                    <Button 
                        as={NextLink}
                        href="/login" 
                        variant="flat" 
                        color="secondary"
                        className="w-full font-medium"
                    >
                        Se connecter
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
