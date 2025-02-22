"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { Button, Card, CardBody, Input, Link } from "@heroui/react";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false // Gestion locale des erreurs
        });

        if (res?.error) {
            setError("Nom d'utilisateur ou mot de passe invalide");
        }
    };

    return (
        <div className="flex items-center justify-center ">
            <Card isBlurred className="w-full max-w-3xl p-6 space-y-6 shadow-xl rounded-2xl">
                <h2 className="text-2xl font-semibold text-center">
                    Connexion
                </h2>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nom d'utilisateur"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <div className="flex flex-col items-center justify-center ">
                          <p className="text-red-500 text-sm text-center">{error}</p>
                          <Link href="/register">Voulez-vous créer un compte ?</Link>
                        </div>}
                        <Button type="submit" className="w-full">
                            Se connecter
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
