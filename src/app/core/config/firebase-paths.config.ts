export const FIREBASE_PATHS = {
    recipes: 'recipes',
    publicRecipes: 'publicRecipes',
    recipeRequests: 'recipeRequests',
    ingredientSuggestions: 'ingredientSuggestions',
    recipeIndexes: {
        byIngredient: 'recipeIndexes/byIngredient',
        byCuisine: 'recipeIndexes/byCuisine',
        byDiet: 'recipeIndexes/byDiet',
        byCookingTime: 'recipeIndexes/byCookingTime',
    },
    quota: {
        dailyByIp: 'quota/dailyByIp',
        dailySystem: 'quota/dailySystem',
    },
    logs: {
        recipeGeneration: 'logs/recipeGeneration',
        workflowErrors: 'logs/workflowErrors',
        quotaExceeded: 'logs/quotaExceeded',
    },
} as const;