import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { buildRecipeDetailRoute } from '../../../../shared/utils/recipe-route.util';
import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeDataService } from '../../../../core/services/recipe-data.service';
import { RECIPE_CATEGORY_DISPLAY_CONFIG } from '../../../../shared/data/recipe-category-display.data';
import { isRecipeCuisine } from '../../../../shared/data/recipe-cuisine.data';
import {
  buildRecipeCardTags,
  getRecipeCookingTimeLabel,
} from '../../../../shared/utils/recipe-tag.util';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
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
  private readonly recipeDataService = inject(RecipeDataService);

  readonly category = this.getCategoryFromRoute();
  readonly config = RECIPE_CATEGORY_DISPLAY_CONFIG[this.category];
  readonly recipes = computed(() => this.getVisibleRecipes());

  /** Returns the detail route for a recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return buildRecipeDetailRoute(recipe);
  }

  /** Returns the display label for a recipe cooking time. */
  getCookingTimeLabel(cookingTime: RecipeCookingTime): string {
    return getRecipeCookingTimeLabel(cookingTime);
  }

  /** Returns readable recipe tags. */
  getRecipeTags(recipe: GeneratedRecipe): string[] {
    return buildRecipeCardTags(recipe);
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
    return this.recipeDataService
      .getRecipesByCuisine(this.category)
      .slice(0, RECIPE_CATEGORY_PAGE_SIZE);
  }
}