// lib/dbConnect.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error(
        "Veuillez définir la variable d’environnement MONGODB_URI dans .env.local"
    );
}

/**
 * On utilise une variable globale nommée "__mongo" pour conserver la connexion
 * en mode développement afin d’éviter d’ouvrir plusieurs connexions.
 */
let cached = global.__mongo;

if (!cached) {
    cached = global.__mongo = { conn: null, promise: null };
}

async function dbConnect(): Promise<mongoose.Mongoose> {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongooseInstance) => {
                return mongooseInstance;
            });
    }
    cached.conn = await cached.promise;

    return cached.conn;
}

export default dbConnect;
