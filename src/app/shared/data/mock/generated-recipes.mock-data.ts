import {
    GeneratedRecipe,
    RecipeGenerationRequest,
    RecipeIngredient,
} from '../../models/recipe-generation.model';

const MOCK_GENERATED_RECIPE_NUMBERS = [1, 2, 3] as const;
const MOCK_GENERATED_RECIPE_LIKES = [66, 42, 18] as const;

/** Builds temporary generated recipes until real matching exists. */
export function createMockGeneratedRecipes(request: RecipeGenerationRequest): GeneratedRecipe[] {
    return MOCK_GENERATED_RECIPE_NUMBERS.map((recipeNumber) =>
        createMockGeneratedRecipe(request, recipeNumber),
    );
}

/** Builds one temporary generated recipe suggestion. */
function createMockGeneratedRecipe(
    request: RecipeGenerationRequest,
    recipeNumber: number,
): GeneratedRecipe {
    const ingredientName = getPrimaryIngredientName(request.ingredients);

    return {
        id: `mock-recipe-${recipeNumber}`,
        title: getMockGeneratedRecipeTitle(ingredientName, recipeNumber),
        description: 'Temporary recipe suggestion until real generation is connected.',
        ingredients: request.ingredients,
        nutrition: getMockGeneratedNutrition(recipeNumber),
        steps: getMockGeneratedSteps(ingredientName),
        cookingTime: request.preferences.cookingTime ?? 'quick',
        cuisine: request.preferences.cuisine ?? 'fusion',
        diet: request.preferences.diet,
        likes: getMockGeneratedRecipeLikes(recipeNumber),
    };
}

/** Returns the first selected ingredient name. */
function getPrimaryIngredientName(ingredients: RecipeIngredient[]): string {
    return ingredients[0]?.name || 'your ingredients';
}

/** Returns a temporary generated recipe title. */
function getMockGeneratedRecipeTitle(ingredientName: string, recipeNumber: number): string {
    const titles = [
        `Easy ${ingredientName} skillet`,
        `Creamy ${ingredientName} bowl`,
        `Fresh ${ingredientName} dinner`,
    ];

    return titles[recipeNumber - 1];
}

/** Returns temporary generated recipe likes. */
function getMockGeneratedRecipeLikes(recipeNumber: number): number {
    return MOCK_GENERATED_RECIPE_LIKES[recipeNumber - 1];
}

/** Returns temporary nutrition values. */
function getMockGeneratedNutrition(recipeNumber: number): GeneratedRecipe['nutrition'] {
    return {
        calories: 420 + recipeNumber * 35,
        protein: 18 + recipeNumber * 2,
        carbohydrates: 48 + recipeNumber * 3,
        fat: 14 + recipeNumber,
    };
}

/** Returns temporary generated cooking steps. */
function getMockGeneratedSteps(ingredientName: string): GeneratedRecipe['steps'] {
    return [
        { order: 1, text: `Prepare ${ingredientName} and all other ingredients.` },
        { order: 2, text: 'Cook everything gently until it smells great.' },
        { order: 3, text: 'Season, plate, and serve warm.' },
    ];
}