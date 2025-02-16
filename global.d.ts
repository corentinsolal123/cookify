// global.d.ts
import mongoose from "mongoose";

declare global {
  // On déclare une variable globale "__mongo" pour stocker la connexion
  var __mongo: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

export {};
