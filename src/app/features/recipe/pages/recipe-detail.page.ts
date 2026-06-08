import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../core/config/app-routes.config';
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

@Component({
  selector: 'app-recipe-detail-page',
  imports: [RouterLink],
  templateUrl: './recipe-detail.page.html',
  styleUrl: './recipe-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly recipeId = this.route.snapshot.paramMap.get('recipeId') ?? '';

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

  /** Returns a readable ingredient amount. */
  getIngredientAmount(ingredient: RecipeIngredient): string {
    return `${ingredient.amount} ${this.getUnitLabel(ingredient.unit)}`;
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