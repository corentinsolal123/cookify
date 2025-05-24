// components/auth/RegisterForm.tsx (Client Component) - optimisé
"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Inscription réussie ! Redirection vers la connexion...");
                // Redirection après succès
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setMessage(`❌ ${data.message || "Erreur lors de l'inscription"}`);
            }
        } catch (err) {
            setMessage("❌ Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
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
                        Créer un compte
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        Rejoignez notre communauté culinaire
                    </p>
                </CardHeader>
                <CardBody className="px-8 py-6">
                    <form onSubmit={handleRegister} className="space-y-5">
                        <Input
                            label="Nom d'utilisateur"
                            type="text"
                            value={formData.username}
                            onChange={handleChange("username")}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            isDisabled={isLoading}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            isDisabled={isLoading}
                            required
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={formData.password}
                            onChange={handleChange("password")}
                            variant="bordered"
                            classNames={{
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-800 dark:text-gray-200",
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-transparent"
                            }}
                            isDisabled={isLoading}
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
                            isDisabled={!formData.username || !formData.email || !formData.password}
                        >
                            {isLoading ? "Inscription..." : "S'inscrire"}
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
                        isDisabled={isLoading}
                    >
                        Se connecter
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}