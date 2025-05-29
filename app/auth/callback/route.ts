// app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const error_description = searchParams.get("error_description");
        const next = searchParams.get("next") ?? "/";

        console.log("Auth callback appelé:", {
            hasCode: !!code,
            hasError: !!error,
            next
        });

        // Si il y a une erreur OAuth
        if (error) {
            console.error("Erreur OAuth:", error, error_description);
            return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`);
        }

        if (code) {
            const supabase = await createClient();

            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
                console.error("Erreur lors de l'échange du code:", exchangeError);
                return NextResponse.redirect(`${origin}/auth/login?error=exchange_failed`);
            }

            if (data.user) {
                console.log("Utilisateur connecté:", data.user.email);

                const forwardedHost = request.headers.get("x-forwarded-host");
                const isLocalEnv = process.env.NODE_ENV === "development";

                if (isLocalEnv) {
                    // En développement local
                    return NextResponse.redirect(`${origin}${next}`);
                } else if (forwardedHost) {
                    // En production (Vercel)
                    return NextResponse.redirect(`https://${forwardedHost}${next}`);
                } else {
                    // Fallback
                    return NextResponse.redirect(`${origin}${next}`);
                }
            }
        }

        // Si pas de code, rediriger vers la page d'accueil
        console.log("Pas de code OAuth reçu, redirection vers accueil");
        return NextResponse.redirect(`${origin}/`);
    } catch (error) {
        console.error("Erreur dans auth callback:", error);
        return NextResponse.redirect(`${origin}/auth/login?error=server_error`);
    }
}