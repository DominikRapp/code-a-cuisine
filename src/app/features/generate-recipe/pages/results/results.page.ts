import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
} from '../../../../shared/models/recipe-generation.model';

@Component({
  selector: 'app-results-page',
  imports: [RouterLink],
  templateUrl: './results.page.html',
  styleUrl: './results.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPage {
  private readonly recipeGenerationService = inject(RecipeGenerationService);
  private readonly router = inject(Router);

  readonly recipes = this.recipeGenerationService.getGeneratedRecipes();
  readonly preferenceTags = this.getPreferenceTags();

  constructor() {
    this.redirectWithoutGeneratedRecipes();
  }

  /** Returns the display label for a generated recipe number. */
  getRecipeNumber(index: number): string {
    return `Recipe ${index + 1}`;
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

  /** Returns the detail route for a generated recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return `/${APP_ROUTES.recipeDetail.replace(':recipeId', recipe.id)}`;
  }

  /** Redirects users who opened results without generated recipes. */
  private redirectWithoutGeneratedRecipes(): void {
    if (this.recipes.length > 0) {
      return;
    }

    this.router.navigate([APP_ROUTES.generateIngredients]);
  }

  /** Returns selected preferences as visible result tags. */
  private getPreferenceTags(): string[] {
    const preferences = this.recipeGenerationService.getPreferences();

    if (!preferences) {
      return [];
    }

    return [
      this.getCuisineLabel(preferences.cuisine),
      this.getCookingTimeTag(preferences.cookingTime),
      this.getDietLabel(preferences.diet),
    ].filter((tag): tag is string => Boolean(tag));
  }

  /** Returns the readable cuisine label. */
  private getCuisineLabel(cuisine: RecipeCuisine | null): string | null {
    const labels: Record<RecipeCuisine, string> = {
      german: 'German',
      italian: 'Italian',
      indian: 'Indian',
      japanese: 'Japanese',
      gourmet: 'Gourmet',
      fusion: 'Fusion',
    };

    return cuisine ? labels[cuisine] : null;
  }

  /** Returns the readable cooking time label. */
  private getCookingTimeTag(cookingTime: RecipeCookingTime | null): string | null {
    const labels: Record<RecipeCookingTime, string> = {
      quick: 'Quick',
      medium: 'Medium',
      complex: 'Complex',
    };

    return cookingTime ? labels[cookingTime] : null;
  }

  /** Returns the readable diet label. */
  private getDietLabel(diet: RecipeDiet | null): string | null {
    const labels: Record<RecipeDiet, string> = {
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
      none: 'No diet preference',
    };

    return diet ? labels[diet] : null;
  }
}