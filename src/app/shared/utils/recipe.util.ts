import { Recipe } from '../models/recipe.model';

/**
 * Checks if a recipe contains ingredients.
 */
export function hasIngredients(
  recipe: Recipe,
): boolean {
  return recipe.ingredients.length > 0;
}