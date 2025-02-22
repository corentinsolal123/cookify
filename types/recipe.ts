export interface IIngredient {
    name: string;
    quantity: number;
    unite: string;
}

export interface IRecipe {
    creator: any;
    _id: string;
    image: string;
    name: string;
    difficulty: string;
    prepTime: number;
    cookTime: number;
    description?: string;
    calories?: number;
    steps: string[];
    ingredients: IIngredient[];
    tags: string[];
}
