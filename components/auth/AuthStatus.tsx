"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

export default function AuthStatus() {
    const { data: session, status } = useSession();

    // Skeleton plus joli pendant le chargement
    if (status === "loading") {
        return (
            <div className="flex gap-2.5">
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-2.5">
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                    Salut {session.user?.name} !
                </span>
                <Button
                    color="default"
                    variant="solid"
                    size="sm"
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
            <Button
                as={Link}
                color="default"
                href="/login"
                variant="solid"
                size="sm"
            >
                Connexion
            </Button>
            <Button
                as={Link}
                href="/register"
                variant="solid"
                size="sm"
                color="primary"
            >
                Inscription
            </Button>
        </div>
    );
}