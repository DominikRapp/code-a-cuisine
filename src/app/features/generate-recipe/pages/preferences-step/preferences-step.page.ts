import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  RECIPE_COOKING_TIME_OPTIONS,
  RECIPE_CUISINE_OPTIONS,
  RECIPE_DIET_OPTIONS,
} from '../../../../shared/data/recipe-preference-options.data';
import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RECIPE_GENERATION_CONFIG } from '../../../../core/config/recipe-generation.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import {
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
} from '../../../../shared/models/recipe-generation.model';
import { LegalFooter } from '../../../../shared/layout/legal-footer/legal-footer';

@Component({
  selector: 'app-preferences-step-page',
  imports: [RouterLink, LegalFooter],
  templateUrl: './preferences-step.page.html',
  styleUrl: './preferences-step.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesStepPage {
  private readonly recipeGenerationService = inject(RecipeGenerationService);
  private readonly router = inject(Router);
  private readonly config = RECIPE_GENERATION_CONFIG;

  readonly servings = signal<number>(this.config.portions.min);
  readonly cookingPersons = signal<number>(this.config.cookingPersons.min);
  readonly cookingTime = signal<RecipeCookingTime | null>(null);
  readonly cuisine = signal<RecipeCuisine | null>(null);
  readonly diet = signal<RecipeDiet | null>(null);
  readonly cookingTimeOptions = RECIPE_COOKING_TIME_OPTIONS;
  readonly cuisineOptions = RECIPE_CUISINE_OPTIONS;
  readonly dietOptions = RECIPE_DIET_OPTIONS;

  /** Saves valid preferences and opens the loading page. */
  generateRecipe(): void {
    if (this.isGenerateDisabled()) {
      return;
    }

    this.savePreferences();
    this.router.navigate([APP_ROUTES.generateLoading]);
  }

  /** Checks whether all required preference groups are selected. */
  isGenerateDisabled(): boolean {
    return !this.cookingTime() || !this.cuisine() || !this.diet();
  }

  /** Decreases the serving amount without going below the minimum. */
  decreaseServings(): void {
    this.servings.update((value) => this.decreaseCounter(value, this.config.portions.min));
  }

  /** Increases the serving amount without exceeding the allowed maximum. */
  increaseServings(): void {
    this.servings.update((value) => this.increaseCounter(value, this.config.portions.max));
  }

  /** Decreases the cooking person amount without going below the minimum. */
  decreaseCookingPersons(): void {
    this.cookingPersons.update((value) => this.decreaseCounter(value, this.config.cookingPersons.min));
  }

  /** Increases the cooking person amount without exceeding the allowed maximum. */
  increaseCookingPersons(): void {
    this.cookingPersons.update((value) => this.increaseCounter(value, this.config.cookingPersons.max));
  }

  /** Selects the preferred cooking time. */
  selectCookingTime(value: RecipeCookingTime): void {
    this.cookingTime.set(value);
  }

  /** Selects the preferred cuisine. */
  selectCuisine(value: RecipeCuisine): void {
    this.cuisine.set(value);
  }

  /** Selects the preferred diet. */
  selectDiet(value: RecipeDiet): void {
    this.diet.set(value);
  }

  /** Checks whether the serving value is at its minimum. */
  isMinServings(): boolean {
    return this.servings() === this.config.portions.min;
  }

  /** Checks whether the serving value is at its maximum. */
  isMaxServings(): boolean {
    return this.servings() === this.config.portions.max;
  }

  /** Checks whether the cooking person value is at its minimum. */
  isMinCookingPersons(): boolean {
    return this.cookingPersons() === this.config.cookingPersons.min;
  }

  /** Checks whether the cooking person value is at its maximum. */
  isMaxCookingPersons(): boolean {
    return this.cookingPersons() === this.config.cookingPersons.max;
  }

  /** Returns the matching label for the selected serving count. */
  getServingLabel(): string {
    return this.servings() === 1 ? 'Portion' : 'Portions';
  }

  /** Returns the matching label for the selected cooking person count. */
  getCookingPersonLabel(): string {
    return this.cookingPersons() === 1 ? 'Person' : 'Persons';
  }

  /** Saves the current preferences for the loading step. */
  private savePreferences(): void {
    this.recipeGenerationService.setPreferences({
      servings: this.servings(),
      cookingPersons: this.cookingPersons(),
      cookingTime: this.cookingTime(),
      cuisine: this.cuisine(),
      diet: this.diet(),
    });
  }

  /** Decreases a counter value by one and clamps it to the minimum. */
  private decreaseCounter(value: number, minValue: number): number {
    return Math.max(minValue, value - 1);
  }

  /** Increases a counter value by one and clamps it to the maximum. */
  private increaseCounter(value: number, maxValue: number): number {
    return Math.min(maxValue, value + 1);
  }
}