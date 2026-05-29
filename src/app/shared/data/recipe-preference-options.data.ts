import {
    RecipeCookingTime,
    RecipeCuisine,
    RecipeDiet,
} from '../models/recipe-generation.model';

export interface RecipeCookingTimeOption {
    value: RecipeCookingTime;
    label: string;
    note: string;
}

export interface RecipeCuisineOption {
    value: RecipeCuisine;
    label: string;
}

export interface RecipeDietOption {
    value: RecipeDiet;
    label: string;
}

export const RECIPE_COOKING_TIME_OPTIONS: RecipeCookingTimeOption[] = [
    { value: 'quick', label: 'Quick', note: 'ab to 20min' },
    { value: 'medium', label: 'Medium', note: '25-40min' },
    { value: 'complex', label: 'Complex', note: 'over 45min' },
];

export const RECIPE_CUISINE_OPTIONS: RecipeCuisineOption[] = [
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'indian', label: 'Indian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'gourmet', label: 'Gourmet' },
    { value: 'fusion', label: 'Fusion' },
];

export const RECIPE_DIET_OPTIONS: RecipeDietOption[] = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'none', label: 'No preferences' },
];