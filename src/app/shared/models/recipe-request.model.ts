import { Ingredient } from './ingredient.model';
import { RecipePreferences } from './recipe-preferences.model';

export interface RecipeRequest {
  ingredients: Ingredient[];
  preferences: RecipePreferences;
}