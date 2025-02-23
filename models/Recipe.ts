import mongoose, { Document, Schema } from "mongoose";

export interface IRecipe extends Document {
    image?: string;
    tags?: string[];

    name: string;
    description: string;
    difficulty: string;
    prepTime: number;
    cookTime: number;
    calories: number;
    creator: string;
    steps: string[];
    ingredients: mongoose.Types.ObjectId[];
}

const RecipeSchema: Schema<IRecipe> = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        difficulty: { type: String, required: true },
        prepTime: { type: Number, required: true },
        cookTime: { type: Number, required: true },
        calories: { type: Number },
        creator: { type: String, required: true },
        image: { type: String },
        steps: { type: [String], required: true },
        ingredients: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true }
        ],
        tags: { type: [String], default: [] }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);
