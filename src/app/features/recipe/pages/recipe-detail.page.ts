import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../core/config/app-routes.config';
import { RECIPE_GENERATION_CONFIG } from '../../../core/config/recipe-generation.config';
import { RecipeDataService } from '../../../core/services/recipe-data.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
  RecipeIngredient,
  RecipeStep,
} from '../../../shared/models/recipe-generation.model';
import {
  getRecipeCookingTimeLabel,
  getRecipeCuisineLabel,
  getRecipeDietLabel,
} from '../../../shared/utils/recipe-tag.util';
import { getIngredientUnitLabel } from '../../../shared/utils/ingredient.util';
import {
  RecipeChefIcon,
  getRecipeChefIconByStep,
  getRecipeChefIcons,
} from '../../../shared/data/recipe-chef-icons.data';
import { LegalFooter } from '../../../shared/layout/legal-footer/legal-footer';

@Component({
  selector: 'app-recipe-detail-page',
  imports: [RouterLink, LegalFooter],
  templateUrl: './recipe-detail.page.html',
  styleUrl: './recipe-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly recipeId = this.route.snapshot.paramMap.get('recipeId') ?? '';
  private readonly requestedServings = this.getRequestedServings();

  readonly recipe = computed(() => this.getRecipeFromRoute());

  constructor() {
    this.redirectWithoutRecipe();
  }

  /** Toggles the local like state for the selected recipe. */
  toggleLike(recipe: GeneratedRecipe): void {
    this.recipeDataService.toggleRecipeLike(recipe.id);
  }

  /** Checks whether the selected recipe is liked locally. */
  isLiked(recipe: GeneratedRecipe): boolean {
    return this.recipeDataService.isRecipeLiked(recipe.id);
  }

  /** Returns the accessible like button label. */
  getLikeButtonLabel(recipe: GeneratedRecipe): string {
    return this.isLiked(recipe) ? 'Remove recipe like' : 'Like this recipe';
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return getRecipeCookingTimeLabel(cookingTime);
  }

  /** Returns the readable cuisine label. */
  getCuisineLabel(cuisine: RecipeCuisine): string {
    return getRecipeCuisineLabel(cuisine);
  }

  /** Returns the readable diet label. */
  getDietLabel(diet: RecipeDiet | null): string {
    return getRecipeDietLabel(diet);
  }

  /** Returns the serving count shown for one recipe. */
  getServingCount(recipe: GeneratedRecipe): number {
    return this.requestedServings ?? recipe.baseServings;
  }

  /** Returns a readable scaled ingredient amount. */
  getIngredientAmount(recipe: GeneratedRecipe, ingredient: RecipeIngredient): string {
    const amount = this.getScaledAmount(recipe, ingredient.amount);

    return `${this.formatAmount(amount)} ${this.getUnitLabel(ingredient.unit)}`;
  }

  /** Returns one scaled nutrition value. */
  getNutritionAmount(recipe: GeneratedRecipe, amount: number): string {
    return this.formatAmount(this.getScaledAmount(recipe, amount));
  }

  /** Returns the configured cooking person count. */
  getCookingPersonCount(recipe: GeneratedRecipe): number {
    return recipe.cookingPersons ?? 1;
  }

  /** Returns chef icons for one recipe. */
  getChefIcons(recipe: GeneratedRecipe): RecipeChefIcon[] {
    return getRecipeChefIcons(this.getCookingPersonCount(recipe));
  }

  /** Returns one chef icon for a step. */
  getStepChefIcon(recipe: GeneratedRecipe, step: RecipeStep, index: number): string {
    return step.chefIcon ?? getRecipeChefIconByStep(index, this.getChefIcons(recipe)).src;
  }

  /** Returns one chef alt text for a step. */
  getStepChefAlt(step: RecipeStep): string {
    return `Chef ${step.chefNumber ?? 1}`;
  }

  /** Returns the serving value from the result detail query parameter. */
  private getRequestedServings(): number | null {
    const servings = Number(this.route.snapshot.queryParamMap.get('servings'));

    return this.isValidServingCount(servings) ? servings : null;
  }

  /** Checks whether one route serving count is allowed. */
  private isValidServingCount(servings: number): boolean {
    return Number.isInteger(servings)
      && servings >= RECIPE_GENERATION_CONFIG.portions.min
      && servings <= RECIPE_GENERATION_CONFIG.portions.max;
  }

  /** Scales one amount to the visible serving count. */
  private getScaledAmount(recipe: GeneratedRecipe, amount: number): number {
    return amount * this.getServingCount(recipe) / Math.max(recipe.baseServings, 1);
  }

  /** Formats one scaled amount without unnecessary decimal places. */
  private formatAmount(amount: number): string {
    return String(Math.round(amount * 100) / 100);
  }

  /** Returns the readable ingredient unit label. */
  private getUnitLabel(unit: RecipeIngredient['unit']): string {
    return getIngredientUnitLabel(unit);
  }

  /** Reads the selected recipe from the recipe data service. */
  private getRecipeFromRoute(): GeneratedRecipe | null {
    return this.recipeDataService.getRecipeById(this.recipeId);
  }

  /** Redirects users who opened an invalid recipe detail page. */
  private redirectWithoutRecipe(): void {
    if (this.recipe() || !this.recipeDataService.isLibraryLoaded()) {
      return;
    }

    this.router.navigate([APP_ROUTES.generateIngredients]);
  }
}