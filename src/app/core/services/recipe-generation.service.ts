import { Injectable, computed, inject, signal } from '@angular/core';

import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { createMockGeneratedRecipes } from '../../shared/data/mock/generated-recipes.mock-data';
import {
  GeneratedRecipe,
  RecipeGenerationRequest,
  RecipeIngredient,
  RecipePreferences,
} from '../../shared/models/recipe-generation.model';
import { RecipeDataService } from './recipe-data.service';

@Injectable({
  providedIn: 'root',
})
export class RecipeGenerationService {
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly ingredients = signal<RecipeIngredient[]>([]);
  private readonly preferences = signal<RecipePreferences | null>(null);
  private readonly maxGeneratedRecipes = RECIPE_GENERATION_CONFIG.generatedRecipes.max;

  readonly hasIngredients = computed(() => this.ingredients().length > 0);
  readonly hasPreferences = computed(() => this.preferences() !== null);
  readonly hasRequest = computed(() => this.getRequest() !== null);
  readonly hasGeneratedRecipes = computed(() => this.recipeDataService.hasGeneratedRecipes());

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
    const topRecipes = this.getTopRecipesByLikes(recipes).slice(0, this.maxGeneratedRecipes);
    this.recipeDataService.setGeneratedRecipes(topRecipes);
  }

  /** Stores temporary generated mock recipes until the real API exists. */
  createMockRecipes(): void {
    const request = this.getRequest();

    if (!request) {
      this.setGeneratedRecipes([]);
      return;
    }

    this.setGeneratedRecipes(createMockGeneratedRecipes(request));
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
    this.recipeDataService.clearGeneratedRecipes();
  }

  /** Returns recipes sorted by likes descending. */
  private getTopRecipesByLikes(recipes: GeneratedRecipe[]): GeneratedRecipe[] {
    return [...recipes].sort((first, second) => second.likes - first.likes);
  }
}