import {
    FirebaseBooleanIndex,
    FirebaseRecipeRecord,
    FirebaseRecipeRequestRecord,
} from './firebase-recipe.model';

export interface FirebaseDatabaseRoot {
    recipes: Record<string, FirebaseRecipeRecord>;
    publicRecipes: FirebaseBooleanIndex;
    recipeRequests: Record<string, FirebaseRecipeRequestRecord>;
    ingredientSuggestions: Record<string, FirebaseIngredientSuggestionRecord>;
    recipeIndexes: FirebaseRecipeIndexes;
    quota: FirebaseQuotaRoot;
    logs: FirebaseLogRoot;
}

export interface FirebaseIngredientSuggestionRecord {
    displayName: string;
    normalizedName: string;
    approved: boolean;
    usageCount: number;
    sourceRecipeIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface FirebaseRecipeIndexes {
    byIngredient: Record<string, FirebaseBooleanIndex>;
    byCuisine: Record<string, FirebaseBooleanIndex>;
    byDiet: Record<string, FirebaseBooleanIndex>;
    byCookingTime: Record<string, FirebaseBooleanIndex>;
}

export interface FirebaseQuotaRoot {
    dailyByIp: Record<string, Record<string, FirebaseQuotaRecord>>;
    dailySystem: Record<string, FirebaseQuotaRecord>;
}

export interface FirebaseQuotaRecord {
    used: number;
    limit: number;
    updatedAt: string;
}

export interface FirebaseLogRoot {
    recipeGeneration: Record<string, FirebaseRecipeGenerationLogRecord>;
    workflowErrors: Record<string, FirebaseWorkflowErrorLogRecord>;
    quotaExceeded: Record<string, FirebaseQuotaExceededLogRecord>;
}

export interface FirebaseRecipeGenerationLogRecord {
    requestId: string;
    status: string;
    source: string;
    recipeIds: string[];
    createdAt: string;
}

export interface FirebaseWorkflowErrorLogRecord {
    requestId: string | null;
    message: string;
    createdAt: string;
}

export interface FirebaseQuotaExceededLogRecord {
    ipHash: string;
    quotaType: 'ip' | 'system';
    createdAt: string;
}