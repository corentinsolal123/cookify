// lib/auth.ts
import bcrypt from "bcryptjs";
import clientPromise from "./mongodb";

// Remplace "yourDatabaseName" par le nom de ta base de données
const DATABASE_NAME = "cookifyDB";

export async function findUserByUsername(username: string) {
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const user = await db.collection("users").findOne({ username });
    return user;
}

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

export async function createUser(
    username: string,
    email: string,
    password: string
) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    const result = await db.collection("users").insertOne({
        username,
        email,
        password: hashedPassword,
    });
    const newUser = await db.collection("users").findOne({ _id: result.insertedId });
    return newUser;
}
