import {
    RecipeCookingTime,
    RecipeCuisine,
    RecipeDiet,
} from '../models/recipe-generation.model';

export const RECIPE_COOKING_TIME_LABELS: Record<RecipeCookingTime, string> = {
    quick: '20min',
    medium: '35min',
    complex: '60min',
};

export const RECIPE_COOKING_TIME_TAGS: Record<RecipeCookingTime, string> = {
    quick: 'Quick',
    medium: 'Medium',
    complex: 'Complex',
};

export const RECIPE_CUISINE_LABELS: Record<RecipeCuisine, string> = {
    german: 'German',
    italian: 'Italian',
    indian: 'Indian',
    japanese: 'Japanese',
    gourmet: 'Gourmet',
    fusion: 'Fusion',
};

export const RECIPE_DIET_LABELS: Record<RecipeDiet, string> = {
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    keto: 'Keto',
    none: 'No diet preference',
};