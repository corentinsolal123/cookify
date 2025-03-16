import mongoose, { Schema, Document } from "mongoose";

export interface IIngredient extends Document {
    name: string;
    quantityPerServing: number;
    unit: string;
    calories: number
}

const IngredientSchema: Schema<IIngredient> = new Schema(
    {
        name: { type: String, required: true },
        quantityPerServing: { type: Number, required: true },
        unit: { type: String, required: true },
    },
    {
        timestamps: true, // Ajoute createdAt et updatedAt
    }
);

export default mongoose.models.Ingredient || mongoose.model<IIngredient>("Ingredient", IngredientSchema);
