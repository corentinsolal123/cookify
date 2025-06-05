"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<{ error: any }>;
    signInWithProvider: (provider: "google" | "apple") => Promise<{ error: any }>;
    supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Créer le client Supabase côté navigateur
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        // Récupérer la session actuelle
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Erreur lors de la récupération de la session:", error);
                } else {
                    setSession(session);
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la session:", error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth event:", event, session?.user?.email);

                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Gestion spéciale pour la déconnexion
                if (event === "SIGNED_OUT") {
                    // Optionnel : rediriger vers la page d'accueil
                    window.location.href = "/";
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    // Inscription
    const signUp = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });
            return { error };
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            return { error };
        }
    };

    // Connexion
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            return { error };
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            return { error };
        }
    };

    // Déconnexion
    const signOut = async () => {
        try {
            // Clear les cookies côté client
            const { error } = await supabase.auth.signOut();

            if (!error) {
                // Force refresh pour nettoyer l'état
                window.location.href = "/";
            }

            return { error };
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            return { error };
        }
    };

    // Connexion avec provider (Google, Apple, etc.)
    const signInWithProvider = async (provider: "google" | "apple") => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    // Paramètres spécifiques pour Google OAuth
                    ...(provider === "google" && {
                        queryParams: {
                            access_type: "offline",
                            prompt: "consent"
                        }
                    })
                }
            });
            return { error };
        } catch (error) {
            console.error(`Erreur lors de la connexion avec ${provider}:`, error);
            return { error };
        }
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithProvider,
        supabase
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}