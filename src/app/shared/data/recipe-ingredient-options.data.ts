import { RecipeIngredientUnit } from '../models/recipe-generation.model';

export const RECIPE_INGREDIENT_UNIT_OPTIONS: RecipeIngredientUnit[] = [
    'piece',
    'ml',
    'gram',
];

export const RECIPE_INGREDIENT_UNIT_LABELS: Record<RecipeIngredientUnit, string> = {
    piece: 'piece',
    ml: 'ml',
    gram: 'g',
};