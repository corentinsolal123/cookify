"use client";

import React, { useState } from "react";
import { Button, Card, Input } from "@heroui/react";

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

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
    };

    return (
        <div className="flex items-center justify-center">
            <Card isBlurred className="w-full max-w-xl p-6 space-y-6  shadow-xl rounded-2xl">
                <h2 className="text-2xl font-semibold text-center">
                    Inscription
                </h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <Input
                        label="Nom d'utilisateur"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {message && (
                        <p className={`text-sm text-center ${message.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>
                            {message}
                        </p>
                    )}
                    <Button type="submit" className="w-full">
                        S'inscrire
                    </Button>
                </form>
            </Card>
        </div>
    );
}
