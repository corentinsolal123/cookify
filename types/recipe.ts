export interface IIngredient {
  nom: string;
  quantiteParPortion: number;
  unite: string;
}

export interface IRecipe {
  _id: string;
  titre: string;
  description?: string;
  calories?: number;
  etapes: string[];
  ingredients: IIngredient[];
  tags: string[];
}
