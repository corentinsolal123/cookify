// models/Recipe.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IIngredient {
    nom: string;
    quantiteParPortion: number;
    unite: string;
}

export interface IRecipe extends Document {
    titre: string;
    description?: string;
    calories?: number;
    etapes: string[];
    ingredients: IIngredient[];
    tags: string[];
}

const RecipeSchema: Schema<IRecipe> = new Schema({
    titre: { type: String, required: true },
    description: { type: String },
    calories: { type: Number },
    etapes: { type: [String], required: true },
    ingredients: [
        {
            nom: { type: String, required: true },
            quantiteParPortion: { type: Number, required: true },
            unite: { type: String, required: true }
        }
    ],
    tags: { type: [String], default: [] }
});

// Pour éviter l'erreur de recompilation en mode développement,
// on vérifie si le modèle existe déjà dans mongoose.models
export default mongoose.models.Recipe ||
mongoose.model<IRecipe>("Recipe", RecipeSchema);
