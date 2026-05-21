export const FIREBASE_PATHS = {
    recipes: 'recipes',
    publicRecipes: 'publicRecipes',
    recipeRequests: 'recipeRequests',
    quota: {
        dailyByIp: 'quota/dailyByIp',
        dailySystem: 'quota/dailySystem',
    },
    logs: {
        recipeGeneration: 'logs/recipeGeneration',
        workflowErrors: 'logs/workflowErrors',
    },
} as const;