import { Ingredient } from '../models/ingredient.model';

/**
 * Creates a normalized ingredient.
 */
export function createIngredient(
  id: string,
  name: string,
): Ingredient {
  return {
    id,
    name: name.trim(),
  };
}