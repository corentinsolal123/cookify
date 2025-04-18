// lib/auth.ts
import bcrypt from "bcryptjs";
import clientPromise from "./mongodb";

export async function findUserByUsername(username: string) {
    const client = await clientPromise;
    const db = client.db();
    return await db.collection("users").findOne({ username });
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
    const db = client.db();
    const result = await db.collection("users").insertOne({
        username,
        email,
        password: hashedPassword
    });
    const newUser = await db.collection("users").findOne({ _id: result.insertedId });
    return newUser;
}
