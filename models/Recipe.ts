import mongoose, { Schema, Document } from "mongoose";

export interface IRecipe extends Document {
    titre: string;
    description?: string;
    calories?: number;
    etapes: string[];
    ingredients: { nom: string; quantiteParPortion: number; unite: string }[];
    tags: string[];
}

const RecipeSchema: Schema<IRecipe> = new Schema(
    {
        titre: { type: String, required: true },
        description: { type: String },
        calories: { type: Number },
        etapes: { type: [String], required: true },
        ingredients: [
            {
                nom: { type: String, required: true },
                quantiteParPortion: { type: Number, required: true },
                unite: { type: String, required: true },
            }
        ],
        tags: { type: [String], default: [] },
    },
    { collection: "cookifyDB" } // Spécifie explicitement le nom de la collection
);

export default mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);
