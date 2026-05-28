import { Injectable, computed, signal } from '@angular/core';

import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { MOCK_RECIPE_LIBRARY } from '../../shared/data/mock-recipes.data';
import {
  GeneratedRecipe,
  RecipeCuisine,
  RecipeGenerationRequest,
  RecipeIngredient,
  RecipePreferences
} from '../../shared/models/recipe-generation.model';

const LIKED_RECIPE_IDS_STORAGE_KEY = 'code-a-cuisine-liked-recipe-ids';
const MOST_LIKED_RECIPE_COUNT = 5;

@Injectable({
  providedIn: 'root',
})
export class RecipeGenerationService {
  private readonly ingredients = signal<RecipeIngredient[]>([]);
  private readonly preferences = signal<RecipePreferences | null>(null);
  private readonly generatedRecipes = signal<GeneratedRecipe[]>([]);
  private readonly libraryRecipes = signal<GeneratedRecipe[]>(MOCK_RECIPE_LIBRARY);
  private readonly likedRecipeIds = signal<Set<string>>(this.loadLikedRecipeIds());
  private readonly maxGeneratedRecipes = RECIPE_GENERATION_CONFIG.generatedRecipes.max;

  readonly hasIngredients = computed(() => this.ingredients().length > 0);
  readonly hasPreferences = computed(() => this.preferences() !== null);
  readonly hasRequest = computed(() => this.getRequest() !== null);
  readonly hasGeneratedRecipes = computed(() => this.generatedRecipes().length > 0);

  /** Stores the selected ingredients for recipe generation. */
  setIngredients(ingredients: RecipeIngredient[]): void {
    this.ingredients.set([...ingredients]);
  }

  /** Stores the selected recipe preferences. */
  setPreferences(preferences: RecipePreferences): void {
    this.preferences.set({ ...preferences });
  }

  /** Stores matching recipes sorted by likes and capped to three. */
  setGeneratedRecipes(recipes: GeneratedRecipe[]): void {
    this.generatedRecipes.set(this.getTopRecipesByLikes(recipes).slice(0, this.maxGeneratedRecipes));
  }

  /** Stores temporary generated mock recipes until the real API exists. */
  createMockRecipes(): void {
    const request = this.getRequest();

    if (!request) {
      this.setGeneratedRecipes([]);
      return;
    }

    this.setGeneratedRecipes(this.buildMockRecipes(request));
  }

  /** Returns the selected ingredients. */
  getIngredients(): RecipeIngredient[] {
    return [...this.ingredients()];
  }

  /** Returns the selected preferences. */
  getPreferences(): RecipePreferences | null {
    const preferences = this.preferences();
    return preferences ? { ...preferences } : null;
  }

  /** Returns generated recipes for the results page. */
  getGeneratedRecipes(): GeneratedRecipe[] {
    return this.applyLocalLikes(this.generatedRecipes());
  }

  /** Returns one recipe by id from generated or library recipes. */
  getGeneratedRecipeById(recipeId: string): GeneratedRecipe | null {
    const recipe = this.getAllBaseRecipes().find((item) => item.id === recipeId);
    return recipe ? this.applyLocalLike(recipe) : null;
  }

  /** Returns the most liked cookbook recipes. */
  getMostLikedRecipes(): GeneratedRecipe[] {
    return this.getTopRecipesByLikes(this.applyLocalLikes(this.getAllBaseRecipes())).slice(
      0,
      MOST_LIKED_RECIPE_COUNT,
    );
  }

  /** Returns cookbook recipes for one cuisine category. */
  getRecipesByCuisine(cuisine: RecipeCuisine): GeneratedRecipe[] {
    const recipes = this.applyLocalLikes(this.getAllBaseRecipes());

    return this.getTopRecipesByLikes(
      recipes.filter((recipe) => recipe.cuisine === cuisine),
    );
  }

  /** Checks whether a recipe is liked locally. */
  isRecipeLiked(recipeId: string): boolean {
    return this.likedRecipeIds().has(recipeId);
  }

  /** Toggles a local recipe like. */
  toggleRecipeLike(recipeId: string): void {
    const nextIds = this.getNextLikedRecipeIds(recipeId);
    this.setLikedRecipeIds(nextIds);
  }

  /** Builds the full generation request when all required data exists. */
  getRequest(): RecipeGenerationRequest | null {
    const preferences = this.preferences();

    if (!preferences || this.ingredients().length === 0) {
      return null;
    }

    return {
      ingredients: this.getIngredients(),
      preferences: { ...preferences },
    };
  }

  /** Clears the current generation state. */
  reset(): void {
    this.ingredients.set([]);
    this.preferences.set(null);
    this.generatedRecipes.set([]);
  }

  /** Returns all base recipes before local like adjustments. */
  private getAllBaseRecipes(): GeneratedRecipe[] {
    return [...this.libraryRecipes(), ...this.generatedRecipes()];
  }

  /** Returns the next local liked recipe id list. */
  private getNextLikedRecipeIds(recipeId: string): string[] {
    if (this.isRecipeLiked(recipeId)) {
      return [...this.likedRecipeIds()].filter((id) => id !== recipeId);
    }

    return [...this.likedRecipeIds(), recipeId];
  }

  /** Updates the local liked recipe id storage. */
  private setLikedRecipeIds(recipeIds: string[]): void {
    this.likedRecipeIds.set(new Set(recipeIds));
    localStorage.setItem(LIKED_RECIPE_IDS_STORAGE_KEY, JSON.stringify(recipeIds));
  }

  /** Applies local like state to multiple recipes. */
  private applyLocalLikes(recipes: GeneratedRecipe[]): GeneratedRecipe[] {
    return recipes.map((recipe) => this.applyLocalLike(recipe));
  }

  /** Applies local like state to one recipe. */
  private applyLocalLike(recipe: GeneratedRecipe): GeneratedRecipe {
    const localLikeCount = this.isRecipeLiked(recipe.id) ? 1 : 0;
    return { ...recipe, likes: recipe.likes + localLikeCount };
  }

  /** Returns recipes sorted by likes descending. */
  private getTopRecipesByLikes(recipes: GeneratedRecipe[]): GeneratedRecipe[] {
    return [...recipes].sort((first, second) => second.likes - first.likes);
  }

  /** Builds temporary generated recipes until real matching exists. */
  private buildMockRecipes(request: RecipeGenerationRequest): GeneratedRecipe[] {
    return [1, 2, 3].map((recipeNumber) =>
      this.buildMockRecipe(request, recipeNumber),
    );
  }

  /** Builds one temporary generated recipe suggestion. */
  private buildMockRecipe(
    request: RecipeGenerationRequest,
    recipeNumber: number,
  ): GeneratedRecipe {
    const ingredientName = this.getPrimaryIngredientName(request.ingredients);

    return {
      id: `mock-recipe-${recipeNumber}`,
      title: this.getMockRecipeTitle(ingredientName, recipeNumber),
      description: 'Temporary recipe suggestion until real generation is connected.',
      ingredients: request.ingredients,
      nutrition: this.getMockNutrition(recipeNumber),
      steps: this.getMockSteps(ingredientName),
      cookingTime: request.preferences.cookingTime ?? 'quick',
      cuisine: request.preferences.cuisine ?? 'fusion',
      diet: request.preferences.diet,
      likes: this.getMockLikes(recipeNumber),
    };
  }

  /** Returns locally stored liked recipe ids. */
  private loadLikedRecipeIds(): Set<string> {
    const storedRecipeIds = localStorage.getItem(LIKED_RECIPE_IDS_STORAGE_KEY);

    if (!storedRecipeIds) {
      return new Set();
    }

    return new Set(JSON.parse(storedRecipeIds) as string[]);
  }

  /** Returns the first selected ingredient name. */
  private getPrimaryIngredientName(ingredients: RecipeIngredient[]): string {
    return ingredients[0]?.name || 'your ingredients';
  }

  /** Returns a temporary generated recipe title. */
  private getMockRecipeTitle(ingredientName: string, recipeNumber: number): string {
    const titles = [
      `Easy ${ingredientName} skillet`,
      `Creamy ${ingredientName} bowl`,
      `Fresh ${ingredientName} dinner`,
    ];

    return titles[recipeNumber - 1];
  }

  /** Returns temporary generated recipe likes. */
  private getMockLikes(recipeNumber: number): number {
    const likes = [66, 42, 18];

    return likes[recipeNumber - 1];
  }

  /** Returns temporary nutrition values. */
  private getMockNutrition(recipeNumber: number): GeneratedRecipe['nutrition'] {
    return {
      calories: 420 + recipeNumber * 35,
      protein: 18 + recipeNumber * 2,
      carbohydrates: 48 + recipeNumber * 3,
      fat: 14 + recipeNumber,
    };
  }

  /** Returns temporary generated cooking steps. */
  private getMockSteps(ingredientName: string): GeneratedRecipe['steps'] {
    return [
      { order: 1, text: `Prepare ${ingredientName} and all other ingredients.` },
      { order: 2, text: 'Cook everything gently until it smells great.' },
      { order: 3, text: 'Season, plate, and serve warm.' },
    ];
  }
}