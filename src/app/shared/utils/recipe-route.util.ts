import { APP_ROUTES } from '../../core/config/app-routes.config';
import {
    GeneratedRecipe,
    RecipeCuisine,
} from '../models/recipe-generation.model';

/** Builds the absolute route for one recipe detail page. */
export function buildRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return `/${APP_ROUTES.recipeDetail.replace(':recipeId', recipe.id)}`;
}

/** Builds the absolute route for one cookbook category page. */
export function buildCookbookCategoryRoute(cuisine: RecipeCuisine): string {
    return `/${APP_ROUTES.cookbookCategory.replace(':categoryId', cuisine)}`;
}