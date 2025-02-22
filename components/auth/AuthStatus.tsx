"use client";

import { signOut, useSession } from "next-auth/react";
import { Button, Link } from "@heroui/react";

export default function AuthStatus() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p>Chargement...</p>;
    }

    if (session) {
        return (
            <div className="flex gap-2.5">
                <p>Connecté en tant que {session.user?.name}</p>
                <Button
                    color="default"
                    variant="solid"
                    onPress={() =>
                        signOut({ redirect: true, callbackUrl: "/" })
                    }
                >
                    Déconnexion
                </Button>
            </div>
        );
    }
    return (
        <div className="flex gap-2.5">
            <Button as={Link} color="default" href="/login" variant="solid">
                Connexion
            </Button>
            <Button
                as={Link}
                href="/register"
                variant="solid"
                className="bg-warning-light text-white hover:bg-warning"
            >                Inscription
            </Button>
        </div>
    );
}
