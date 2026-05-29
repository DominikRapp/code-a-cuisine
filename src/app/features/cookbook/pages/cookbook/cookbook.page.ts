import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RECIPE_COOKING_TIME_LABELS } from '../../../../shared/data/recipe-display.data';
import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
} from '../../../../shared/models/recipe-generation.model';
import { RECIPE_CUISINE_CARDS } from '../../../../shared/data/recipe-cuisine-card.data';

@Component({
  selector: 'app-cookbook-page',
  imports: [RouterLink],
  templateUrl: './cookbook.page.html',
  styleUrl: './cookbook.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookbookPage {
  private readonly recipeGenerationService = inject(RecipeGenerationService);

  readonly cuisineCards = RECIPE_CUISINE_CARDS;
  readonly mostLikedRecipes = computed(() =>
    this.recipeGenerationService.getMostLikedRecipes(),
  );

  /** Returns the category route for a cuisine card. */
  getCuisineCategoryRoute(cuisine: string): string {
    return `/${APP_ROUTES.cookbookCategory.replace(':category', cuisine)}`;
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return RECIPE_COOKING_TIME_LABELS[cookingTime];
  }

  /** Returns the detail route for a recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return `/${APP_ROUTES.recipeDetail.replace(':recipeId', recipe.id)}`;
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