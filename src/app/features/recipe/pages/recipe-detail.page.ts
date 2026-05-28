import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../core/services/recipe-generation.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
  RecipeIngredient,
} from '../../../shared/models/recipe-generation.model';

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

  readonly recipe = computed(() => this.getRecipeFromRoute());
  readonly preferences = this.recipeGenerationService.getPreferences();
  readonly chefIcons = this.getChefIcons();

  constructor() {
    this.redirectWithoutRecipe();
  }

  /** Toggles the local like state for the selected recipe. */
  toggleLike(recipe: GeneratedRecipe): void {
    this.recipeGenerationService.toggleRecipeLike(recipe.id);
  }

  /** Checks whether the selected recipe is liked locally. */
  isLiked(recipe: GeneratedRecipe): boolean {
    return this.recipeGenerationService.isRecipeLiked(recipe.id);
  }

  /** Returns the accessible like button label. */
  getLikeButtonLabel(recipe: GeneratedRecipe): string {
    return this.isLiked(recipe) ? 'Remove recipe like' : 'Like this recipe';
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    const labels: Record<RecipeCookingTime, string> = {
      quick: '20min',
      medium: '35min',
      complex: '60min',
    };

    return labels[cookingTime];
  }

  /** Returns the readable cuisine label. */
  getCuisineLabel(cuisine: RecipeCuisine): string {
    const labels: Record<RecipeCuisine, string> = {
      german: 'German',
      italian: 'Italian',
      indian: 'Indian',
      japanese: 'Japanese',
      gourmet: 'Gourmet',
      fusion: 'Fusion',
    };

    return labels[cuisine];
  }

  /** Returns the readable diet label. */
  getDietLabel(diet: RecipeDiet | null): string {
    const labels: Record<RecipeDiet, string> = {
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
      none: 'No diet preference',
    };

    return diet ? labels[diet] : 'No diet preference';
  }

  /** Returns a readable ingredient amount. */
  getIngredientAmount(ingredient: RecipeIngredient): string {
    return `${ingredient.amount}${this.getUnitLabel(ingredient.unit)}`;
  }

  /** Returns one chef icon for a step index. */
  getStepChefIcon(stepIndex: number): string {
    return this.chefIcons[stepIndex % this.chefIcons.length];
  }

  /** Returns one chef alt text for a step index. */
  getStepChefAlt(stepIndex: number): string {
    return `Chef ${(stepIndex % this.chefIcons.length) + 1}`;
  }

  /** Returns a readable ingredient unit. */
  private getUnitLabel(unit: RecipeIngredient['unit']): string {
    return unit === 'piece' ? ' piece' : unit;
  }

  /** Reads the selected recipe from the generation service. */
  private getRecipeFromRoute(): GeneratedRecipe | null {
    return this.recipeGenerationService.getGeneratedRecipeById(this.recipeId);
  }

  /** Redirects users who opened an invalid recipe detail page. */
  private redirectWithoutRecipe(): void {
    if (this.recipe()) {
      return;
    }

    this.router.navigate([APP_ROUTES.generateIngredients]);
  }

  /** Returns chef icons for the selected cooking person count. */
  private getChefIcons(): string[] {
    const count = this.preferences?.cookingPersons ?? 1;

    return Array.from({ length: count }, (_, index) =>
      `assets/images/svg/chef-${this.getChefIconName(index + 1)}.svg`,
    );
  }

  /** Returns the matching chef icon file name part. */
  private getChefIconName(index: number): string {
    const iconNames = ['one', 'two', 'three', 'four'];

    return iconNames[index - 1];
  }
}