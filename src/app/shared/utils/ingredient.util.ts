import { RECIPE_INGREDIENT_UNIT_LABELS } from '../data/recipe-ingredient-options.data';
import {
  RecipeIngredient,
  RecipeIngredientUnit,
} from '../models/recipe-generation.model';

export const INGREDIENT_AMOUNT_MAX_DIGITS = 4;
export const INGREDIENT_AMOUNT_MAX_VALUE = 9999;

/** Creates a normalized recipe ingredient. */
export function createRecipeIngredient(
  name: string,
  amount: number,
  unit: RecipeIngredientUnit,
): RecipeIngredient {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount,
    unit,
  };
}

/** Returns an ingredient with updated amount and unit when the id matches. */
export function updateRecipeIngredientAmountAndUnit(
  ingredient: RecipeIngredient,
  ingredientId: string,
  amount: number,
  unit: RecipeIngredientUnit,
): RecipeIngredient {
  if (ingredient.id !== ingredientId) {
    return ingredient;
  }

  return {
    ...ingredient,
    amount,
    unit,
  };
}

/** Removes invalid characters from an ingredient name input. */
export function sanitizeIngredientNameInput(value: string): string {
  return value.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ');
}

/** Converts an amount input into limited digits or empty value. */
export function sanitizeIngredientAmountInput(value: string | number | null): number | null {
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, INGREDIENT_AMOUNT_MAX_DIGITS);

  return digits ? Number(digits) : null;
}

/** Converts an ingredient amount input into a valid positive amount. */
export function toIngredientAmount(value: string | number | null): number | null {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0 || amount > INGREDIENT_AMOUNT_MAX_VALUE) {
    return null;
  }

  return amount;
}

/** Checks whether an ingredient name has usable text. */
export function hasIngredientName(value: string): boolean {
  return value.trim().length > 0;
}

/** Returns the readable ingredient unit label. */
export function getIngredientUnitLabel(unit: RecipeIngredientUnit): string {
  return RECIPE_INGREDIENT_UNIT_LABELS[unit];
}

/** Returns the visible ingredient list unit label. */
export function getVisibleIngredientUnitLabel(unit: RecipeIngredientUnit): string {
  return unit === 'piece' ? '' : getIngredientUnitLabel(unit);
}