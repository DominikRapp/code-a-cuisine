import {
    RecipeCookingTime,
    RecipeCuisine,
    RecipeDiet,
    RecipeIngredientUnit,
} from './recipe-generation.model';

export type FirebaseRecipeSource = 'library' | 'generated';

export type FirebaseRecipeRequestStatus = 'pending' | 'matched' | 'generated' | 'failed';

export type FirebaseBooleanIndex = Record<string, true>;

export interface FirebaseRecipeIngredient {
    name: string;
    normalizedName: string;
    amount: number;
    unit: RecipeIngredientUnit;
}

export interface FirebaseRecipeNutrition {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
}

export interface FirebaseRecipeStep {
    order: number;
    text: string;
    chefNumber?: number;
    chefIcon?: string;
}

export interface FirebaseRecipeRecord {
    id: string;
    title: string;
    description: string;
    tags: string[];
    searchKeywords: string[];
    ingredients: FirebaseRecipeIngredient[];
    ingredientIndex: FirebaseBooleanIndex;
    requiredIngredientNames: string[];
    extraBasicIngredientNames: string[];
    nutrition: FirebaseRecipeNutrition;
    steps: FirebaseRecipeStep[];
    baseServings: number;
    cookingPersonsMin: number;
    cookingPersonsMax: number;
    cookingPersons?: number;
    chefIcons?: string[];
    cookingTime: RecipeCookingTime;
    cuisine: RecipeCuisine;
    diet: RecipeDiet;
    likes: number;
    source: FirebaseRecipeSource;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FirebaseRecipeRequestRecord {
    ingredients: FirebaseRecipeIngredient[];
    ingredientIndex: FirebaseBooleanIndex;
    requestedIngredientNames: string[];
    servings: number;
    cookingPersons: number;
    cookingTime: RecipeCookingTime;
    cuisine: RecipeCuisine;
    diet: RecipeDiet;
    minIngredientMatchPercent: number;
    maxExtraBasicIngredients: number;
    status: FirebaseRecipeRequestStatus;
    matchedRecipeIds: string[];
    generatedRecipeIds: string[];
    usedIngredientPercent: number;
    error: string | null;
    ipHash: string | null;
    createdAt: string;
    updatedAt: string;
}