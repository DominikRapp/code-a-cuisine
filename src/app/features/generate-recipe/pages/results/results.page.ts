import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeDataService } from '../../../../core/services/recipe-data.service';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
} from '../../../../shared/models/recipe-generation.model';
import { buildRecipeDetailRoute } from '../../../../shared/utils/recipe-route.util';
import {
  buildPreferenceTags,
  getRecipeCookingTimeLabel,
} from '../../../../shared/utils/recipe-tag.util';
import { LegalFooter } from '../../../../shared/layout/legal-footer/legal-footer';

@Component({
  selector: 'app-results-page',
  imports: [RouterLink, LegalFooter],
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
  readonly detailQueryParams = this.getDetailQueryParams();

  constructor() {
    this.redirectWithoutGeneratedRecipes();
  }

  /** Returns the display label for a generated recipe number. */
  getRecipeNumber(index: number): string {
    return `Recipe ${index + 1}`;
  }

  /** Returns the result intro text for the visible recipe count. */
  getResultDescription(): string {
    return `We took what you have and found ${this.recipes.length} recipe suggestion.`;
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return getRecipeCookingTimeLabel(cookingTime);
  }

  /** Returns the detail route for a generated recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return buildRecipeDetailRoute(recipe);
  }

  /** Checks whether a visible result recipe was newly generated. */
  isNewRecipe(recipe: GeneratedRecipe): boolean {
    return this.recipeGenerationService.isNewRecipe(recipe.id);
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
    return buildPreferenceTags(this.recipeGenerationService.getPreferences());
  }

  /** Returns the requested servings for recipe detail links. */
  private getDetailQueryParams(): { servings: number } | null {
    const servings = this.recipeGenerationService.getPreferences()?.servings;

    return servings ? { servings } : null;
  }
}