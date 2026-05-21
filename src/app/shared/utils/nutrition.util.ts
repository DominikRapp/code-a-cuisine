import { Nutrition } from '../models/nutrition.model';

/**
 * Calculates total nutrition values.
 */
export function calculateNutritionTotal(
  nutrition: Nutrition,
): number {
  return (
    nutrition.calories +
    nutrition.protein +
    nutrition.carbohydrates +
    nutrition.fat
  );
}