import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getRecipeCookingTimeLabel } from '../../../../shared/utils/recipe-tag.util';
import { RecipeDataService } from '../../../../core/services/recipe-data.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
} from '../../../../shared/models/recipe-generation.model';
import { RECIPE_CUISINE_CARDS } from '../../../../shared/data/recipe-cuisine-card.data';
import {
  buildCookbookCategoryRoute,
  buildRecipeDetailRoute,
} from '../../../../shared/utils/recipe-route.util';
import { LegalFooter } from '../../../../shared/layout/legal-footer/legal-footer';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';

@Component({
  selector: 'app-cookbook-page',
  imports: [RouterLink, LegalFooter],
  templateUrl: './cookbook.page.html',
  styleUrl: './cookbook.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookbookPage {
  private readonly recipeDataService = inject(RecipeDataService);
  private readonly recipeGenerationService = inject(RecipeGenerationService);

  readonly cuisineCards = RECIPE_CUISINE_CARDS;
  readonly mostLikedRecipes = computed(() =>
    this.recipeDataService.getMostLikedRecipes()
  );

  /** Returns the category route for a cuisine card. */
  getCuisineCategoryRoute(cuisine: RecipeCuisine): string {
    return buildCookbookCategoryRoute(cuisine);
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return getRecipeCookingTimeLabel(cookingTime);
  }

  /** Returns the detail route for a recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return buildRecipeDetailRoute(recipe);
  }

  /** Clears the current result before starting a new recipe flow. */
  startNewRecipe(): void {
    this.recipeGenerationService.startNewRecipe();
  }

  /** Converts vertical wheel movement into horizontal recipe scrolling. */
  scrollLikedRecipes(event: WheelEvent): void {
    const scrollElement = event.currentTarget as HTMLElement;
    const scrollDistance = event.deltaY || event.deltaX;

    if (scrollDistance === 0) {
      return;
    }

    event.preventDefault();
    scrollElement.scrollBy({
      left: scrollDistance,
      behavior: 'auto',
    });
  }
}