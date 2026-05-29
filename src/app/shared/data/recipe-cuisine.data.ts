import { RecipeCuisine } from '../models/recipe-generation.model';

export const RECIPE_CUISINES: RecipeCuisine[] = [
    'german',
    'italian',
    'indian',
    'japanese',
    'gourmet',
    'fusion',
];

/** Checks if a route value is a supported recipe cuisine. */
export function isRecipeCuisine(value: string | null): value is RecipeCuisine {
    return RECIPE_CUISINES.includes(value as RecipeCuisine);
}