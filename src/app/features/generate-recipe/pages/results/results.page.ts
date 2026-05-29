import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RecipeDataService } from '../../../../core/services/recipe-data.service';
import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import {
  RECIPE_COOKING_TIME_LABELS,
  RECIPE_COOKING_TIME_TAGS,
  RECIPE_CUISINE_LABELS,
  RECIPE_DIET_LABELS,
} from '../../../../shared/data/recipe-display.data';
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
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly recipeGenerationService = inject(RecipeGenerationService);
  private readonly router = inject(Router);

  readonly recipes = this.recipeDataService.getGeneratedRecipes();
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
    return RECIPE_COOKING_TIME_LABELS[cookingTime];
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
    return cuisine ? RECIPE_CUISINE_LABELS[cuisine] : null;
  }

  /** Returns the readable cooking time label. */
  private getCookingTimeTag(cookingTime: RecipeCookingTime | null): string | null {
    return cookingTime ? RECIPE_COOKING_TIME_TAGS[cookingTime] : null;
  }

  /** Returns the readable diet label. */
  private getDietLabel(diet: RecipeDiet | null): string | null {
    return diet ? RECIPE_DIET_LABELS[diet] : null;
  }
}