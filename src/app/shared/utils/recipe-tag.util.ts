import {
    RECIPE_COOKING_TIME_LABELS,
    RECIPE_COOKING_TIME_TAGS,
    RECIPE_CUISINE_LABELS,
    RECIPE_DIET_LABELS,
} from '../data/recipe-display.data';
import {
    GeneratedRecipe,
    RecipeCookingTime,
    RecipeCuisine,
    RecipeDiet,
    RecipePreferences,
} from '../models/recipe-generation.model';

/** Returns visible preference tags for the results page. */
export function buildPreferenceTags(preferences: RecipePreferences | null): string[] {
    if (!preferences) {
        return [];
    }

    return [
        getCuisineTag(preferences.cuisine),
        getCookingTimeTag(preferences.cookingTime),
        getDietTag(preferences.diet),
    ].filter(isVisibleTag);
}

/** Returns visible card tags for one recipe. */
export function buildRecipeCardTags(recipe: GeneratedRecipe): string[] {
    return [
        getDietTag(recipe.diet),
        getCookingTimeTag(recipe.cookingTime),
    ].filter(isVisibleTag);
}

/** Returns the visible cooking time label for recipe cards. */
export function getRecipeCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return RECIPE_COOKING_TIME_LABELS[cookingTime];
}

/** Returns the visible cuisine label for recipe details. */
export function getRecipeCuisineLabel(cuisine: RecipeCuisine): string {
    return RECIPE_CUISINE_LABELS[cuisine];
}

/** Returns the visible diet label for recipe details. */
export function getRecipeDietLabel(diet: RecipeDiet | null): string {
    return diet ? RECIPE_DIET_LABELS[diet] : RECIPE_DIET_LABELS.none;
}

/** Returns one cuisine tag. */
function getCuisineTag(cuisine: RecipeCuisine | null): string | null {
    return cuisine ? RECIPE_CUISINE_LABELS[cuisine] : null;
}

/** Returns one cooking time tag. */
function getCookingTimeTag(cookingTime: RecipeCookingTime | null): string | null {
    return cookingTime ? RECIPE_COOKING_TIME_TAGS[cookingTime] : null;
}

/** Returns one diet tag. */
function getDietTag(diet: RecipeDiet | null): string | null {
    return diet && diet !== 'none' ? RECIPE_DIET_LABELS[diet] : null;
}

/** Checks whether a tag should be visible. */
function isVisibleTag(tag: string | null): tag is string {
    return Boolean(tag);
}