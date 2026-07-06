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
import { N8nWorkflowService } from './n8n-workflow.service';
import { RecipeGenerationQuotaStatusService } from './recipe-generation-quota-status.service';
import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { LAST_GENERATED_RESULTS_STORAGE_KEY } from '../config/recipe-storage.config';
import { RecipeRequestService } from './recipe-request.service';
import { FirebaseRecipeRequestRecord } from '../../shared/models/firebase-recipe.model';

interface StoredGeneratedResults {
  recipeIds: string[];
  newRecipeIds: string[];
  preferences: RecipePreferences | null;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeGenerationService {
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly ingredients = signal<RecipeIngredient[]>([]);
  private readonly preferences = signal<RecipePreferences | null>(null);
  private readonly lastError = signal<RecipeGenerationError | null>(null);
  private readonly minIngredientCount = RECIPE_GENERATION_CONFIG.ingredients.minCount;
  private readonly recipeRequestService = inject(RecipeRequestService);
  private readonly lastRequestId = signal<string | null>(null);
  private readonly newRecipeIds = signal<Set<string>>(new Set());
  private readonly n8nWorkflowService = inject(N8nWorkflowService);
  private readonly recipeGenerationQuotaStatusService = inject(
    RecipeGenerationQuotaStatusService,
  );

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

  /** Writes the request, starts n8n, and waits for workflow results. */
  async generateRecipes(): Promise<RecipeGenerationResult> {
    const request = this.getRequest();

    if (!request) {
      return this.createFailedResult('missing-request');
    }

    this.clearNewRecipeIds();
    const requestId = await this.createFirebaseRequest(request);

    return this.createWorkflowResult(requestId);
  }

  /** Returns the latest Firebase request id. */
  getLastRequestId(): string | null {
    return this.lastRequestId();
  }

  /** Stores matching recipes in the recipe data service. */
  setGeneratedRecipes(recipes: GeneratedRecipe[]): void {
    this.recipeDataService.setGeneratedRecipes(recipes);
  }

  /** Returns the latest generation error. */
  getLastError(): RecipeGenerationError | null {
    return this.lastError();
  }

  /** Restores the latest successful recipe result for the current browser session. */
  async restoreLastGeneratedResults(): Promise<GeneratedRecipe[]> {
    const storedResults = this.readStoredGeneratedResults();

    if (!storedResults || storedResults.recipeIds.length === 0) {
      return [];
    }

    const recipes = await this.recipeDataService.getRecipesByIds(
      storedResults.recipeIds,
    );

    if (recipes.length === 0) {
      this.clearStoredGeneratedResults();
      return [];
    }

    const restoredRecipeIds = new Set(recipes.map((recipe) => recipe.id));

    this.setGeneratedRecipes(recipes);
    this.setNewRecipeIds(
      storedResults.newRecipeIds.filter((recipeId) =>
        restoredRecipeIds.has(recipeId),
      ),
    );

    if (storedResults.preferences) {
      this.preferences.set({ ...storedResults.preferences });
    }

    return recipes;
  }

  /** Checks whether a recipe was newly generated for the latest request. */
  isNewRecipe(recipeId: string): boolean {
    return this.newRecipeIds().has(recipeId);
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
    this.clearNewRecipeIds();
    this.lastRequestId.set(null);
    this.clearStoredGeneratedResults();
  }

  /** Stores the latest successful result ids for the current browser session. */
  private storeGeneratedResults(recipes: GeneratedRecipe[]): void {
    const storedResults: StoredGeneratedResults = {
      recipeIds: recipes.map((recipe) => recipe.id),
      newRecipeIds: [...this.newRecipeIds()],
      preferences: this.getPreferences(),
    };

    try {
      sessionStorage.setItem(
        LAST_GENERATED_RESULTS_STORAGE_KEY,
        JSON.stringify(storedResults),
      );
    } catch {
      return;
    }
  }

  /** Returns the latest stored result ids for the current browser session. */
  private readStoredGeneratedResults(): StoredGeneratedResults | null {
    try {
      const storedValue = sessionStorage.getItem(
        LAST_GENERATED_RESULTS_STORAGE_KEY,
      );

      if (!storedValue) {
        return null;
      }

      const parsedValue = JSON.parse(
        storedValue,
      ) as Partial<StoredGeneratedResults>;

      if (!Array.isArray(parsedValue.recipeIds)) {
        this.clearStoredGeneratedResults();
        return null;
      }

      return {
        recipeIds: parsedValue.recipeIds.filter(this.isString),
        newRecipeIds: Array.isArray(parsedValue.newRecipeIds)
          ? parsedValue.newRecipeIds.filter(this.isString)
          : [],
        preferences: parsedValue.preferences ?? null,
      };
    } catch {
      this.clearStoredGeneratedResults();
      return null;
    }
  }

  /** Clears the stored latest recipe result. */
  private clearStoredGeneratedResults(): void {
    try {
      sessionStorage.removeItem(LAST_GENERATED_RESULTS_STORAGE_KEY);
    } catch {
      return;
    }
  }

  /** Checks whether one value is a string. */
  private isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /** Creates and stores one failed generation result. */
  private createFailedResult(error: RecipeGenerationError): RecipeGenerationResult {
    this.lastError.set(error);
    this.clearNewRecipeIds();
    this.setGeneratedRecipes([]);

    return { status: 'failed', source: 'firebase', recipes: [], error };
  }

  /** Clears the latest generation error. */
  private clearLastError(): void {
    this.lastError.set(null);
  }

  /** Creates one Firebase request for the n8n workflow. */
  private async createFirebaseRequest(request: RecipeGenerationRequest): Promise<string | null> {
    try {
      const requestId = await this.recipeRequestService.createRequest(request);
      this.lastRequestId.set(requestId);
      return requestId;
    } catch {
      this.lastRequestId.set(null);
      return null;
    }
  }

  /** Creates a result from the finished n8n workflow request. */
  private async createWorkflowResult(requestId: string | null): Promise<RecipeGenerationResult> {
    if (!requestId) {
      return this.createFailedResult('generation-failed');
    }

    await this.triggerWorkflow();
    const record = await this.recipeRequestService.waitForFinalRequest(requestId);

    return record ? this.createRequestResult(record) : this.createFailedResult('generation-failed');
  }

  /** Creates the final UI result from one Firebase request record. */
  private async createRequestResult(record: FirebaseRecipeRequestRecord): Promise<RecipeGenerationResult> {
    if (record.status !== 'completed') {
      return this.createFailedResult(this.mapRequestError(record.status));
    }

    const generatedRecipeIds = record.generatedRecipeIds ?? [];

    this.setNewRecipeIds(generatedRecipeIds);
    await this.refreshQuotaAfterGeneratedRecipes(generatedRecipeIds);

    const recipes = await this.recipeDataService.getRecipesByIds(
      this.recipeRequestService.getResultRecipeIds(record),
    );

    return this.createRecipesResult(recipes);
  }

  /** Refreshes the displayed quota after one confirmed new recipe generation. */
  private async refreshQuotaAfterGeneratedRecipes(recipeIds: string[]): Promise<void> {
    if (recipeIds.length === 0) {
      return;
    }

    await this.recipeGenerationQuotaStatusService.refreshAfterSuccessfulGeneration();
  }

  /** Creates the result from resolved Firebase recipes. */
  private createRecipesResult(recipes: GeneratedRecipe[]): RecipeGenerationResult {
    if (recipes.length === 0) {
      return this.createFailedResult('no-recipes');
    }

    this.setGeneratedRecipes(recipes);
    this.storeGeneratedResults(recipes);
    this.completeSuccessfulGeneration();

    return { status: 'success', source: 'n8n', recipes, error: null };
  }

  /** Clears only the completed ingredient input after successful results are available. */
  private completeSuccessfulGeneration(): void {
    this.ingredients.set([]);
    this.clearLastError();
  }

  /** Clears the ids of recipes newly generated for the latest request. */
  private clearNewRecipeIds(): void {
    this.newRecipeIds.set(new Set());
  }

  /** Stores newly generated recipe ids for the latest request. */
  private setNewRecipeIds(recipeIds: string[]): void {
    this.newRecipeIds.set(new Set(recipeIds));
  }

  /** Maps request status to the existing UI error state. */
  private mapRequestError(status: string): RecipeGenerationError {
    return status === 'quotaExceeded' ? 'quota-exhausted' : 'generation-failed';
  }

  /** Starts the future n8n workflow when a request id exists. */
  private async triggerWorkflow(): Promise<void> {
    const requestId = this.lastRequestId();

    if (!requestId) {
      return;
    }

    try {
      await this.n8nWorkflowService.triggerRecipeGeneration(requestId);
    } catch {
      return;
    }
  }
}