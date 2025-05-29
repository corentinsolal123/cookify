import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                }
            }
        }
    );

    // IMPORTANT: Éviter les boucles infinies en vérifiant les cookies
    // Rafraîchir la session utilisateur seulement si nécessaire
    const {
        data: { user }
    } = await supabase.auth.getUser();

    // Pages protégées - rediriger vers login si pas connecté
    const protectedPaths = ["/recipes/new", "/shopping-lists", "/dashboard"];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (!user && isProtectedPath) {
        // Construire l'URL de redirection avec le callback
        const redirectUrl = new URL("/auth/login", request.url);
        redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Pages auth - rediriger vers accueil si déjà connecté
    const authPaths = ["/auth/login", "/auth/signup"];
    const isAuthPath = authPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (user && isAuthPath) {
        // Vérifier s'il y a une URL de callback
        const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
        const redirectUrl = callbackUrl && callbackUrl.startsWith("/")
            ? new URL(callbackUrl, request.url)
            : new URL("/", request.url);

        return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images in the public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ]
};