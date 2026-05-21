import { Ingredient } from './ingredient.model';
import { Nutrition } from './nutrition.model';

export interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  nutrition: Nutrition;
}