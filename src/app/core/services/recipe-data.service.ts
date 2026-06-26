import { Injectable, signal } from '@angular/core';
import { get, ref } from 'firebase/database';
import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import {
    LIKED_RECIPE_IDS_STORAGE_KEY,
    MOST_LIKED_RECIPE_COUNT,
} from '../config/recipe-storage.config';
import { FIREBASE_PATHS } from '../config/firebase-paths.config';
import { getFirebaseDatabase } from '../firebase/firebase.config';
import { mapFirebaseRecipe } from '../../shared/mappers/firebase-recipe.mapper';
import { FirebaseRecipeRecord } from '../../shared/models/firebase-recipe.model';
import {
    GeneratedRecipe,
    RecipeCookingTime,
    RecipeCuisine,
    RecipeGenerationRequest,
} from '../../shared/models/recipe-generation.model';
import { normalizeFirebaseKey } from '../../shared/utils/firebase-normalization.util';

@Injectable({
    providedIn: 'root',
})
export class RecipeDataService {
    private readonly generatedRecipes = signal<GeneratedRecipe[]>([]);
    private readonly libraryRecipes = signal<GeneratedRecipe[]>([]);
    private readonly libraryRecords = signal<FirebaseRecipeRecord[]>([]);
    private readonly libraryLoaded = signal(false);
    private readonly likedRecipeIds = signal<Set<string>>(this.loadLikedRecipeIds());
    private readonly maxGeneratedRecipes = RECIPE_GENERATION_CONFIG.generatedRecipes.max;
    private readonly libraryLoadPromise = this.loadFirebaseRecipes();

    /** Waits until Firebase recipes are loaded. */
    async waitForLibrary(): Promise<void> {
        await this.libraryLoadPromise;
    }

    /** Stores capped recipes in workflow result order. */
    setGeneratedRecipes(recipes: GeneratedRecipe[]): void {
        const uniqueRecipes = this.getUniqueRecipesById(recipes);

        this.generatedRecipes.set(uniqueRecipes.slice(0, this.maxGeneratedRecipes));
    }

    /** Returns generated recipes with local like values. */
    getGeneratedRecipes(): GeneratedRecipe[] {
        return this.applyLocalLikes(this.generatedRecipes());
    }

    /** Returns current Firebase recipes by their ids. */
    async getRecipesByIds(recipeIds: string[]): Promise<GeneratedRecipe[]> {
        const recipes = await Promise.all(
            recipeIds.map((recipeId) => this.readFirebaseRecipe(recipeId)),
        );

        return recipes.filter((recipe): recipe is GeneratedRecipe => recipe !== null);
    }

    /** Reads one current public recipe directly from Firebase. */
    private async readFirebaseRecipe(recipeId: string): Promise<GeneratedRecipe | null> {
        try {
            const path = `${FIREBASE_PATHS.recipes}/${recipeId}`;
            const snapshot = await get(ref(getFirebaseDatabase(), path));
            const record = snapshot.val() as FirebaseRecipeRecord | null;

            return record?.isPublic ? this.applyLocalLike(mapFirebaseRecipe(record)) : null;
        } catch {
            return null;
        }
    }

    /** Returns true when generated recipes exist. */
    hasGeneratedRecipes(): boolean {
        return this.generatedRecipes().length > 0;
    }

    /** Returns true when Firebase recipes finished loading. */
    isLibraryLoaded(): boolean {
        return this.libraryLoaded();
    }

    /** Returns matching Firebase recipes for the current request. */
    getMatchingRecipes(request: RecipeGenerationRequest): GeneratedRecipe[] {
        const recipes = this.libraryRecords()
            .filter((record) => this.matchesRecipe(record, request))
            .map(mapFirebaseRecipe);

        return this.getTopRecipesByLikes(this.applyLocalLikes(recipes)).slice(0, this.maxGeneratedRecipes);
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
        return recipes.filter((recipe) => recipe.cuisine === cuisine);
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

    /** Loads public recipe records from Firebase. */
    private async loadFirebaseRecipes(): Promise<void> {
        try {
            const snapshot = await get(ref(getFirebaseDatabase(), FIREBASE_PATHS.recipes));
            this.setFirebaseRecipes(snapshot.val());
        } catch {
            this.libraryLoaded.set(true);
        }
    }

    /** Stores mapped Firebase recipe data. */
    private setFirebaseRecipes(value: unknown): void {
        const records = this.getFirebaseRecipeRecords(value);

        this.libraryRecords.set(records);
        this.libraryRecipes.set(records.map(mapFirebaseRecipe));
        this.libraryLoaded.set(true);
    }

    /** Returns valid public Firebase recipe records. */
    private getFirebaseRecipeRecords(value: unknown): FirebaseRecipeRecord[] {
        if (!value || typeof value !== 'object') {
            return [];
        }

        return Object.values(value as Record<string, FirebaseRecipeRecord>).filter(
            (record) => record.isPublic,
        );
    }

    /** Checks whether one recipe matches the request. */
    private matchesRecipe(record: FirebaseRecipeRecord, request: RecipeGenerationRequest): boolean {
        return (
            this.matchesPreferences(record, request) &&
            this.matchesIngredients(record, request)
        );
    }

    /** Checks preference fields for one recipe. */
    private matchesPreferences(record: FirebaseRecipeRecord, request: RecipeGenerationRequest): boolean {
        return (
            record.cuisine === request.preferences.cuisine &&
            this.matchesDiet(record, request) &&
            this.matchesCookingTime(record, request) &&
            this.matchesCookingPersons(record, request.preferences.cookingPersons)
        );
    }

    /** Checks whether the selected diet fits the recipe. */
    private matchesDiet(record: FirebaseRecipeRecord, request: RecipeGenerationRequest): boolean {
        const selectedDiet = request.preferences.diet;

        if (selectedDiet === 'none') {
            return true;
        }

        return selectedDiet === 'vegetarian'
            ? record.diet === 'vegetarian' || record.diet === 'vegan'
            : record.diet === selectedDiet;
    }

    /** Checks whether the recipe stays within the selected cooking time. */
    private matchesCookingTime(
        record: FirebaseRecipeRecord,
        request: RecipeGenerationRequest,
    ): boolean {
        const selectedTime = request.preferences.cookingTime;

        return selectedTime !== null &&
            this.getCookingTimeRank(record.cookingTime) <= this.getCookingTimeRank(selectedTime);
    }

    /** Returns the comparable rank for one cooking time option. */
    private getCookingTimeRank(cookingTime: RecipeCookingTime): number {
        const ranks: Record<RecipeCookingTime, number> = {
            quick: 1,
            medium: 2,
            complex: 3,
        };

        return ranks[cookingTime];
    }

    /** Checks whether the cooking person count fits. */
    private matchesCookingPersons(record: FirebaseRecipeRecord, count: number): boolean {
        return count >= record.cookingPersonsMin && count <= record.cookingPersonsMax;
    }

    /** Checks the configured ingredient matching rules. */
    private matchesIngredients(record: FirebaseRecipeRecord, request: RecipeGenerationRequest): boolean {
        const requestedNames = this.getRequestedIngredientNames(request);
        const extraNames = record.extraBasicIngredientNames ?? [];
        const matchCount = this.countMatchingIngredients(record, requestedNames);

        return (
            this.getIngredientMatchPercent(matchCount, requestedNames.length) >=
            RECIPE_GENERATION_CONFIG.ingredients.minUsagePercent &&
            extraNames.length <= RECIPE_GENERATION_CONFIG.ingredients.maxExtraBasicIngredients
        );
    }

    /** Returns normalized requested ingredient names. */
    private getRequestedIngredientNames(request: RecipeGenerationRequest): string[] {
        return request.ingredients.map((ingredient) => normalizeFirebaseKey(ingredient.name));
    }

    /** Counts requested ingredients that are used by one recipe. */
    private countMatchingIngredients(record: FirebaseRecipeRecord, requestedNames: string[]): number {
        const requiredNames = new Set(record.requiredIngredientNames ?? []);
        return requestedNames.filter((name) => requiredNames.has(name)).length;
    }

    /** Returns the used ingredient percentage. */
    private getIngredientMatchPercent(matchCount: number, ingredientCount: number): number {
        return ingredientCount > 0 ? Math.round((matchCount / ingredientCount) * 100) : 0;
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