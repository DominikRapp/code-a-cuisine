import { Injectable, signal } from '@angular/core';

import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import {
    LIKED_RECIPE_IDS_STORAGE_KEY,
    MOST_LIKED_RECIPE_COUNT,
} from '../config/recipe-storage.config';
import { MOCK_RECIPE_LIBRARY } from '../../shared/data/mock/recipe-library.mock-data';
import {
    GeneratedRecipe,
    RecipeCuisine,
} from '../../shared/models/recipe-generation.model';

@Injectable({
    providedIn: 'root',
})
export class RecipeDataService {
    private readonly generatedRecipes = signal<GeneratedRecipe[]>([]);
    private readonly libraryRecipes = signal<GeneratedRecipe[]>(this.loadLibraryRecipes());
    private readonly likedRecipeIds = signal<Set<string>>(this.loadLikedRecipeIds());
    private readonly maxGeneratedRecipes = RECIPE_GENERATION_CONFIG.generatedRecipes.max;

    /** Stores sorted and capped generated or matched recipes. */
    setGeneratedRecipes(recipes: GeneratedRecipe[]): void {
        const uniqueRecipes = this.getUniqueRecipesById(recipes);
        const topRecipes = this.getTopRecipesByLikes(uniqueRecipes);

        this.generatedRecipes.set(topRecipes.slice(0, this.maxGeneratedRecipes));
    }

    /** Returns generated recipes with local like values. */
    getGeneratedRecipes(): GeneratedRecipe[] {
        return this.applyLocalLikes(this.generatedRecipes());
    }

    /** Returns true when generated recipes exist. */
    hasGeneratedRecipes(): boolean {
        return this.generatedRecipes().length > 0;
    }

    /** Returns one recipe by id from generated or library recipes. */
    getRecipeById(recipeId: string): GeneratedRecipe | null {
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
        return this.getTopRecipesByLikes(recipes.filter((recipe) => recipe.cuisine === cuisine));
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

    /** Clears the current generated recipe state. */
    clearGeneratedRecipes(): void {
        this.generatedRecipes.set([]);
    }

    /** Returns unique base recipes before local like adjustments. */
    private getAllBaseRecipes(): GeneratedRecipe[] {
        const recipes = [...this.libraryRecipes(), ...this.generatedRecipes()];
        return this.getUniqueRecipesById(recipes);
    }

    /** Returns recipes without duplicate recipe ids. */
    private getUniqueRecipesById(recipes: GeneratedRecipe[]): GeneratedRecipe[] {
        const recipeMap = new Map<string, GeneratedRecipe>();

        recipes.forEach((recipe) => recipeMap.set(recipe.id, recipe));

        return [...recipeMap.values()];
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

    /** Loads recipe library data from the current recipe source. */
    private loadLibraryRecipes(): GeneratedRecipe[] {
        return [...MOCK_RECIPE_LIBRARY];
    }

    /** Returns locally stored liked recipe ids. */
    private loadLikedRecipeIds(): Set<string> {
        try {
            return new Set(this.getStoredLikedRecipeIds());
        } catch {
            localStorage.removeItem(LIKED_RECIPE_IDS_STORAGE_KEY);
            return new Set();
        }
    }

    /** Reads liked recipe ids from local storage. */
    private getStoredLikedRecipeIds(): string[] {
        const storedRecipeIds = localStorage.getItem(LIKED_RECIPE_IDS_STORAGE_KEY);

        if (!storedRecipeIds) {
            return [];
        }

        const parsedRecipeIds = JSON.parse(storedRecipeIds);

        return Array.isArray(parsedRecipeIds) ? parsedRecipeIds.filter(this.isString) : [];
    }

    /** Checks whether a value is a string. */
    private isString(value: unknown): value is string {
        return typeof value === 'string';
    }
}