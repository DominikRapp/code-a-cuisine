import {
    GeneratedRecipe,
    RecipeCookingTime,
    RecipeCuisine,
    RecipeDiet,
    RecipeIngredient,
} from '../../models/recipe-generation.model';

interface MockRecipeConfig {
    id: string;
    title: string;
    cookingTime: RecipeCookingTime;
    cuisine: RecipeCuisine;
    diet: RecipeDiet;
    likes: number;
    mainIngredient: string;
}

const MOCK_RECIPE_CONFIGS: MockRecipeConfig[] = [
    { id: 'pasta-spinach-cherry-tomatoes', title: 'Pasta with spinach and cherry tomatoes', cookingTime: 'quick', cuisine: 'italian', diet: 'vegetarian', likes: 66, mainIngredient: 'pasta' },
    { id: 'tomato-basil-risotto', title: 'Tomato basil risotto', cookingTime: 'medium', cuisine: 'italian', diet: 'vegetarian', likes: 41, mainIngredient: 'risotto rice' },
    { id: 'lemon-garlic-gnocchi', title: 'Lemon garlic gnocchi', cookingTime: 'quick', cuisine: 'italian', diet: 'none', likes: 34, mainIngredient: 'gnocchi' },

    { id: 'schnitzel-potato-salad', title: 'Schnitzel with potato salad', cookingTime: 'complex', cuisine: 'german', diet: 'none', likes: 52, mainIngredient: 'schnitzel' },
    { id: 'mushroom-spaetzle-pan', title: 'Mushroom spaetzle pan', cookingTime: 'medium', cuisine: 'german', diet: 'vegetarian', likes: 39, mainIngredient: 'spaetzle' },
    { id: 'cabbage-potato-skillet', title: 'Cabbage potato skillet', cookingTime: 'quick', cuisine: 'german', diet: 'vegan', likes: 28, mainIngredient: 'potatoes' },

    { id: 'indian-curry-rice', title: 'Indian curry rice platter', cookingTime: 'medium', cuisine: 'indian', diet: 'vegetarian', likes: 44, mainIngredient: 'curry rice' },
    { id: 'chickpea-masala-bowl', title: 'Chickpea masala bowl', cookingTime: 'medium', cuisine: 'indian', diet: 'vegan', likes: 37, mainIngredient: 'chickpeas' },
    { id: 'paneer-pepper-pan', title: 'Paneer pepper pan', cookingTime: 'quick', cuisine: 'indian', diet: 'vegetarian', likes: 33, mainIngredient: 'paneer' },

    { id: 'sushi-rice-bowl', title: 'Sushi rice bowl with salmon', cookingTime: 'medium', cuisine: 'japanese', diet: 'none', likes: 49, mainIngredient: 'sushi rice' },
    { id: 'miso-tofu-noodle-soup', title: 'Miso tofu noodle soup', cookingTime: 'quick', cuisine: 'japanese', diet: 'vegetarian', likes: 35, mainIngredient: 'tofu' },
    { id: 'teriyaki-vegetable-don', title: 'Teriyaki vegetable don', cookingTime: 'medium', cuisine: 'japanese', diet: 'vegan', likes: 31, mainIngredient: 'vegetables' },

    { id: 'herb-crusted-salmon', title: 'Herb crusted salmon', cookingTime: 'complex', cuisine: 'gourmet', diet: 'none', likes: 43, mainIngredient: 'salmon' },
    { id: 'truffle-mushroom-polenta', title: 'Truffle mushroom polenta', cookingTime: 'complex', cuisine: 'gourmet', diet: 'vegetarian', likes: 38, mainIngredient: 'polenta' },
    { id: 'roasted-beetroot-tartare', title: 'Roasted beetroot tartare', cookingTime: 'medium', cuisine: 'gourmet', diet: 'vegan', likes: 29, mainIngredient: 'beetroot' },

    { id: 'low-carb-vegan-bake-paleo-bars', title: 'Low Carb Vegan No-Bake Paleo Bars', cookingTime: 'medium', cuisine: 'fusion', diet: 'vegan', likes: 57, mainIngredient: 'nuts' },
    { id: 'kimchi-taco-bowl', title: 'Kimchi taco bowl', cookingTime: 'quick', cuisine: 'fusion', diet: 'vegetarian', likes: 36, mainIngredient: 'kimchi' },
    { id: 'mediterranean-ramen-pan', title: 'Mediterranean ramen pan', cookingTime: 'medium', cuisine: 'fusion', diet: 'none', likes: 27, mainIngredient: 'ramen noodles' },
];

export const MOCK_RECIPE_LIBRARY: GeneratedRecipe[] = MOCK_RECIPE_CONFIGS.map((recipe) =>
    createMockLibraryRecipe(recipe),
);

/** Creates one temporary cookbook recipe for the local mock library. */
function createMockLibraryRecipe(recipe: MockRecipeConfig): GeneratedRecipe {
    return {
        id: recipe.id,
        title: recipe.title,
        description: 'Temporary cookbook recipe until Firebase is connected.',
        ingredients: createMockIngredients(recipe.id, recipe.mainIngredient),
        nutrition: createMockNutrition(recipe.likes),
        steps: createMockSteps(recipe.title),
        cookingTime: recipe.cookingTime,
        cuisine: recipe.cuisine,
        diet: recipe.diet,
        likes: recipe.likes,
    };
}

/** Creates temporary ingredients for one mock recipe. */
function createMockIngredients(recipeId: string, mainIngredient: string): RecipeIngredient[] {
    return [
        { id: `${recipeId}-ingredient-1`, name: mainIngredient, amount: 250, unit: 'gram' },
        { id: `${recipeId}-ingredient-2`, name: 'fresh herbs', amount: 1, unit: 'piece' },
    ];
}

/** Creates temporary nutrition values for one mock recipe. */
function createMockNutrition(likes: number): GeneratedRecipe['nutrition'] {
    return {
        calories: 380 + likes,
        protein: 18,
        carbohydrates: 42,
        fat: 12,
    };
}

/** Creates temporary cooking steps for one mock recipe. */
function createMockSteps(title: string): GeneratedRecipe['steps'] {
    return [
        { order: 1, text: `Prepare everything for ${title}.` },
        { order: 2, text: 'Cook the ingredients until ready.' },
        { order: 3, text: 'Serve warm and enjoy.' },
    ];
}