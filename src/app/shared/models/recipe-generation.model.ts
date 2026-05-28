export type RecipeIngredientUnit = 'piece' | 'ml' | 'gram';

export type RecipeCookingTime = 'quick' | 'medium' | 'complex';

export type RecipeCuisine = 'german' | 'italian' | 'indian' | 'japanese' | 'gourmet' | 'fusion';

export type RecipeDiet = 'vegetarian' | 'vegan' | 'keto' | 'none';

export interface RecipeIngredient {
    id: string;
    name: string;
    amount: number;
    unit: RecipeIngredientUnit;
}

export interface RecipePreferences {
    servings: number;
    cookingPersons: number;
    cookingTime: RecipeCookingTime | null;
    cuisine: RecipeCuisine | null;
    diet: RecipeDiet | null;
}

export interface RecipeGenerationRequest {
    ingredients: RecipeIngredient[];
    preferences: RecipePreferences;
}

export interface RecipeNutrition {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
}

export interface RecipeStep {
    order: number;
    text: string;
}

export interface GeneratedRecipe {
    id: string;
    title: string;
    description: string;
    ingredients: RecipeIngredient[];
    nutrition: RecipeNutrition;
    steps: RecipeStep[];
    cookingTime: RecipeCookingTime;
    cuisine: RecipeCuisine;
    diet: RecipeDiet | null;
    likes: number;
}