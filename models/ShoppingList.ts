import mongoose, { Document, Schema } from "mongoose";

export interface IShoppingListItem extends Document {
    ingredient: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
}

export interface IShoppingList extends Document {
    userId: string;
    name: string;
    items: IShoppingListItem[];
    recipes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ShoppingListItemSchema: Schema = new Schema({
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    checked: { type: Boolean, default: false }
});

const ShoppingListSchema: Schema<IShoppingList> = new Schema(
    {
        userId: { type: String, required: true },
        name: { type: String, default: "My Shopping List" },
        items: [ShoppingListItemSchema],
        recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }]
    },
    {
        timestamps: true
    }
);

export default mongoose.models.ShoppingList || mongoose.model<IShoppingList>("ShoppingList", ShoppingListSchema);