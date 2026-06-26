import { RECIPE_GENERATION_CONFIG } from '../../core/config/recipe-generation.config';
import {
    FirebaseBooleanIndex,
    FirebaseRecipeIngredient,
    FirebaseRecipeRecord,
    FirebaseRecipeRequestRecord,
} from '../models/firebase-recipe.model';
import {
    GeneratedRecipe,
    RecipeGenerationRequest,
    RecipeIngredient,
} from '../models/recipe-generation.model';
import { normalizeFirebaseKey } from '../utils/firebase-normalization.util';

/** Maps Firebase recipe data to the app recipe model. */
export function mapFirebaseRecipe(record: FirebaseRecipeRecord): GeneratedRecipe {
    return {
        id: record.id,
        title: record.title,
        description: record.description,
        ingredients: mapFirebaseIngredients(record.ingredients),
        baseServings: record.baseServings,
        nutrition: { ...record.nutrition },
        steps: [...record.steps],
        cookingTime: record.cookingTime,
        cuisine: record.cuisine,
        diet: record.diet,
        likes: record.likes,
        cookingPersons: record.cookingPersons,
        chefIcons: record.chefIcons,
    };
}

/** Maps the app request to the future Firebase request shape. */
export function mapRecipeRequestToFirebase(
    request: RecipeGenerationRequest,
): FirebaseRecipeRequestRecord {
    const now = new Date().toISOString();

    return {
        ingredients: mapRequestIngredients(request.ingredients),
        ingredientIndex: createIngredientIndex(request.ingredients),
        requestedIngredientNames: getIngredientNames(request.ingredients),
        servings: request.preferences.servings,
        cookingPersons: request.preferences.cookingPersons,
        cookingTime: request.preferences.cookingTime ?? 'quick',
        cuisine: request.preferences.cuisine ?? 'fusion',
        diet: request.preferences.diet ?? 'none',
        minIngredientMatchPercent: RECIPE_GENERATION_CONFIG.ingredients.minUsagePercent,
        maxExtraBasicIngredients: RECIPE_GENERATION_CONFIG.ingredients.maxExtraBasicIngredients,
        status: 'pending',
        matchedRecipeIds: [],
        generatedRecipeIds: [],
        usedIngredientPercent: 0,
        error: null,
        ipHash: null,
        createdAt: now,
        updatedAt: now,
    };
}

/** Maps Firebase ingredients to app ingredients. */
function mapFirebaseIngredients(ingredients: FirebaseRecipeIngredient[]): RecipeIngredient[] {
    return ingredients.map((ingredient, index) => ({
        id: `firebase-ingredient-${index}`,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
    }));
}

/** Maps app ingredients to Firebase ingredients. */
function mapRequestIngredients(ingredients: RecipeIngredient[]): FirebaseRecipeIngredient[] {
    return ingredients.map((ingredient) => ({
        name: ingredient.name,
        normalizedName: normalizeFirebaseKey(ingredient.name),
        amount: ingredient.amount,
        unit: ingredient.unit,
    }));
}

/** Creates a normalized Firebase ingredient index. */
function createIngredientIndex(ingredients: RecipeIngredient[]): FirebaseBooleanIndex {
    return ingredients.reduce<FirebaseBooleanIndex>((index, ingredient) => {
        index[normalizeFirebaseKey(ingredient.name)] = true;
        return index;
    }, {});
}

/** Returns normalized ingredient names for matching. */
function getIngredientNames(ingredients: RecipeIngredient[]): string[] {
    return ingredients.map((ingredient) => normalizeFirebaseKey(ingredient.name));
}