import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
  private readonly pageSize = RECIPE_CATEGORY_PAGE_SIZE;

  readonly category = this.getCategoryFromRoute();
  readonly config = RECIPE_CATEGORY_DISPLAY_CONFIG[this.category];
  readonly currentPage = signal(1);
  readonly allRecipes = computed(() => this.recipeDataService.getRecipesByCuisine(this.category));
  readonly pageCount = computed(() => Math.ceil(this.allRecipes().length / this.pageSize));
  readonly pageNumbers = computed(() => this.getPageNumbers());
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

  /** Moves to the selected page. */
  setPage(page: number): void {
    this.currentPage.set(this.getSafePage(page));
  }

  /** Moves one page back. */
  goToPreviousPage(): void {
    this.setPage(this.currentPage() - 1);
  }

  /** Moves one page forward. */
  goToNextPage(): void {
    this.setPage(this.currentPage() + 1);
  }

  /** Returns true when previous navigation is possible. */
  canGoToPreviousPage(): boolean {
    return this.currentPage() > 1;
  }

  /** Returns true when next navigation is possible. */
  canGoToNextPage(): boolean {
    return this.currentPage() < this.pageCount();
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

  /** Returns visible recipes for the current page. */
  private getVisibleRecipes(): GeneratedRecipe[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.allRecipes().slice(startIndex, startIndex + this.pageSize);
  }

  /** Returns all page numbers. */
  private getPageNumbers(): number[] {
    return Array.from({ length: this.pageCount() }, (_, index) => index + 1);
  }

  /** Keeps page navigation inside the valid range. */
  private getSafePage(page: number): number {
    return Math.min(Math.max(page, 1), this.pageCount());
  }
}