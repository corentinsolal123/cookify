// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string; // Ajout de l'id
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string; // Ajout de l'id
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}
