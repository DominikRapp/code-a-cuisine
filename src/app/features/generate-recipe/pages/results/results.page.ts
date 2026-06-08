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
}