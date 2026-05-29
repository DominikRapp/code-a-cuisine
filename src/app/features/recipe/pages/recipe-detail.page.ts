import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  RECIPE_COOKING_TIME_LABELS,
  RECIPE_CUISINE_LABELS,
  RECIPE_DIET_LABELS,
} from '../../../shared/data/recipe-display.data';
import { APP_ROUTES } from '../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../core/services/recipe-generation.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
  RecipeIngredient,
} from '../../../shared/models/recipe-generation.model';
import { RECIPE_INGREDIENT_UNIT_LABELS } from '../../../shared/data/recipe-ingredient-options.data';
import {
  RecipeChefIcon,
  getRecipeChefIconByStep,
  getRecipeChefIcons,
} from '../../../shared/data/recipe-chef-icons.data';
import { RecipeDataService } from '../../../core/services/recipe-data.service';

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
  private readonly recipeGenerationService = inject(RecipeGenerationService);
  private readonly recipeId = this.route.snapshot.paramMap.get('recipeId') ?? '';
  private readonly recipeDataService = inject(RecipeDataService);

  readonly recipe = computed(() => this.getRecipeFromRoute());
  readonly preferences = this.recipeGenerationService.getPreferences();
  readonly chefIcons = this.getChefIcons();

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
    return RECIPE_COOKING_TIME_LABELS[cookingTime];
  }

  /** Returns the readable cuisine label. */
  getCuisineLabel(cuisine: RecipeCuisine): string {
    return RECIPE_CUISINE_LABELS[cuisine];
  }

  /** Returns the readable diet label. */
  getDietLabel(diet: RecipeDiet | null): string {
    return diet ? RECIPE_DIET_LABELS[diet] : RECIPE_DIET_LABELS.none;
  }

  /** Returns a readable ingredient amount. */
  getIngredientAmount(ingredient: RecipeIngredient): string {
    return `${ingredient.amount} ${this.getUnitLabel(ingredient.unit)}`;
  }

  /** Returns one chef icon for a step index. */
  getStepChefIcon(stepIndex: number): string {
    return getRecipeChefIconByStep(stepIndex, this.chefIcons).src;
  }

  /** Returns one chef alt text for a step index. */
  getStepChefAlt(stepIndex: number): string {
    return getRecipeChefIconByStep(stepIndex, this.chefIcons).alt;
  }

  /** Returns the readable ingredient unit label. */
  private getUnitLabel(unit: RecipeIngredient['unit']): string {
    return RECIPE_INGREDIENT_UNIT_LABELS[unit];
  }

  /** Reads the selected recipe from the generation service. */
  private getRecipeFromRoute(): GeneratedRecipe | null {
    return this.recipeDataService.getRecipeById(this.recipeId);
  }

  /** Redirects users who opened an invalid recipe detail page. */
  private redirectWithoutRecipe(): void {
    if (this.recipe()) {
      return;
    }

    this.router.navigate([APP_ROUTES.generateIngredients]);
  }

  /** Returns chef icons for the selected cooking person count. */
  private getChefIcons(): RecipeChefIcon[] {
    const count = this.preferences?.cookingPersons ?? 1;

    return getRecipeChefIcons(count);
  }
}