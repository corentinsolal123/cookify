"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { router } from "next/client";

export default function AuthStatus() {
    const { signOut, user } = useAuth();

    const handleLogout = async () => {
        const { error } = await signOut();
        if (!error) {
            await router.push("/auth/login");
        }
    };

    if (user) {
        return (
            <div className="flex items-center gap-2.5">
                <Button
                    color="default"
                    variant="solid"
                    size="sm"
                    onPress={handleLogout}
                >
                    Déconnexion
                </Button>
            </div>
        );
    } else {
        return (
            <div className="flex gap-2.5">
                <Button
                    as={Link}
                    color="default"
                    href="/auth/login"
                    variant="solid"
                    size="sm"
                >
                    Connexion
                </Button>
                <Button
                    as={Link}
                    href="/auth/signup"
                    variant="solid"
                    size="sm"
                    color="primary"
                >
                    Inscription
                </Button>
            </div>
        );
    }
}