import { Injectable, computed, inject, signal } from '@angular/core';

import {
  GeneratedRecipe,
  RecipeGenerationError,
  RecipeGenerationRequest,
  RecipeGenerationResult,
  RecipeIngredient,
  RecipePreferences,
} from '../../shared/models/recipe-generation.model';
import { RecipeDataService } from './recipe-data.service';
import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';

@Injectable({
  providedIn: 'root',
})
export class RecipeGenerationService {
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly ingredients = signal<RecipeIngredient[]>([]);
  private readonly preferences = signal<RecipePreferences | null>(null);
  private readonly lastError = signal<RecipeGenerationError | null>(null);
  private readonly minIngredientCount = RECIPE_GENERATION_CONFIG.ingredients.minCount;

  readonly hasIngredients = computed(() => this.ingredients().length >= this.minIngredientCount);
  readonly hasPreferences = computed(() => this.preferences() !== null);
  readonly hasRequest = computed(() => this.getRequest() !== null);
  readonly hasGeneratedRecipes = computed(() => this.recipeDataService.hasGeneratedRecipes());

  /** Stores the selected ingredients for recipe generation. */
  setIngredients(ingredients: RecipeIngredient[]): void {
    this.ingredients.set([...ingredients]);
    this.clearLastError();
  }

  /** Stores the selected recipe preferences. */
  setPreferences(preferences: RecipePreferences): void {
    this.preferences.set({ ...preferences });
    this.clearLastError();
  }

  /** Runs the current Firebase matching flow. */
  generateRecipes(): RecipeGenerationResult {
    const request = this.getRequest();

    if (!request) {
      return this.createFailedResult('missing-request');
    }

    return this.createFirebaseResult(request);
  }

  /** Stores matching recipes in the recipe data service. */
  setGeneratedRecipes(recipes: GeneratedRecipe[]): void {
    this.recipeDataService.setGeneratedRecipes(recipes);
  }

  /** Returns the latest generation error. */
  getLastError(): RecipeGenerationError | null {
    return this.lastError();
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

  /** Builds the full generation request when all required data exists. */
  getRequest(): RecipeGenerationRequest | null {
    const preferences = this.preferences();

    if (!preferences || this.ingredients().length < this.minIngredientCount) {
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
    this.clearLastError();
    this.recipeDataService.clearGeneratedRecipes();
  }

  /** Creates the temporary Firebase matching result. */
  private createFirebaseResult(request: RecipeGenerationRequest): RecipeGenerationResult {
    const recipes = this.recipeDataService.getMatchingRecipes(request);

    if (recipes.length === 0) {
      return this.createFailedResult('no-recipes');
    }

    this.setGeneratedRecipes(recipes);
    this.clearLastError();

    return { status: 'success', source: 'firebase', recipes, error: null };
  }

  /** Creates and stores one failed generation result. */
  private createFailedResult(error: RecipeGenerationError): RecipeGenerationResult {
    this.lastError.set(error);
    this.setGeneratedRecipes([]);

    return { status: 'failed', source: 'firebase', recipes: [], error };
  }

  /** Clears the latest generation error. */
  private clearLastError(): void {
    this.lastError.set(null);
  }
}