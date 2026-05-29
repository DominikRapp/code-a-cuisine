import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import { RECIPE_CATEGORY_DISPLAY_CONFIG } from '../../../../shared/data/recipe-category-display.data';
import { isRecipeCuisine } from '../../../../shared/data/recipe-cuisine.data';
import {
  RECIPE_COOKING_TIME_LABELS,
  RECIPE_COOKING_TIME_TAGS,
  RECIPE_DIET_LABELS,
} from '../../../../shared/data/recipe-display.data';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
} from '../../../../shared/models/recipe-generation.model';
import { RECIPE_CATEGORY_PAGE_SIZE } from '../../../../core/config/recipe-list.config';

@Component({
  selector: 'app-category-recipes-page',
  imports: [RouterLink],
  templateUrl: './category-recipes.page.html',
  styleUrl: './category-recipes.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryRecipesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeGenerationService = inject(RecipeGenerationService);

  readonly category = this.getCategoryFromRoute();
  readonly config = RECIPE_CATEGORY_DISPLAY_CONFIG[this.category];
  readonly recipes = computed(() => this.getVisibleRecipes());

  /** Returns the detail route for a recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return `/${APP_ROUTES.recipeDetail.replace(':recipeId', recipe.id)}`;
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return RECIPE_COOKING_TIME_LABELS[cookingTime];
  }

  /** Returns readable recipe tags. */
  getRecipeTags(recipe: GeneratedRecipe): string[] {
    return [
      this.getDietLabel(recipe.diet),
      this.getCookingTimeTag(recipe.cookingTime),
    ].filter((tag): tag is string => Boolean(tag));
  }

  /** Returns the selected category from the route. */
  private getCategoryFromRoute(): RecipeCuisine {
    const categoryId = this.route.snapshot.paramMap.get('categoryId');

    if (isRecipeCuisine(categoryId)) {
      return categoryId;
    }

    this.router.navigate([APP_ROUTES.cookbook]);
    return 'italian';
  }

  /** Returns visible recipes for the current category. */
  private getVisibleRecipes(): GeneratedRecipe[] {
    return this.recipeGenerationService
      .getRecipesByCuisine(this.category)
      .slice(0, RECIPE_CATEGORY_PAGE_SIZE);
  }

  /** Returns the readable cooking time tag. */
  private getCookingTimeTag(cookingTime: RecipeCookingTime): string {
    return RECIPE_COOKING_TIME_TAGS[cookingTime];
  }

  /** Returns the readable diet label. */
  private getDietLabel(diet: RecipeDiet | null): string | null {
    return diet && diet !== 'none' ? RECIPE_DIET_LABELS[diet] : null;
  }
}