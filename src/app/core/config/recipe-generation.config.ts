export const RECIPE_GENERATION_CONFIG = {
    portions: {
        min: 1,
        max: 12,
    },
    cookingPersons: {
        min: 1,
        max: 4,
    },
    generatedRecipes: {
        max: 3,
    },
    ingredients: {
        minCount: 3,
        minUsagePercent: 70,
        maxExtraBasicIngredients: 3,
        maxSuggestions: 3,
    },
    loading: {
        delayMs: 2500,
    },
    workflow: {
        pollIntervalMs: 500,
        maxWaitMs: 60000,
    },
    quota: {
        perIpPerDay: 3,
        systemPerDay: 12,
    },
    requests: {
        maxStored: 3,
    },
};