import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import {
  GeneratedRecipe,
  RecipeCookingTime,
  RecipeCuisine,
  RecipeDiet,
} from '../../../../shared/models/recipe-generation.model';

const CATEGORY_PAGE_SIZE = 15;

interface CategoryPageConfig {
  title: string;
  label: string;
  heroDesktop: string;
  heroMobile: string;
}

const CATEGORY_PAGE_CONFIG: Record<RecipeCuisine, CategoryPageConfig> = {
  italian: {
    title: 'Italian cuisine',
    label: 'Italian recipe list',
    heroDesktop: 'assets/images/svg/italian-cousine-hero.svg',
    heroMobile: 'assets/images/svg/italian-cousine-hero-mobile.svg',
  },
  german: {
    title: 'German cuisine',
    label: 'German recipe list',
    heroDesktop: 'assets/images/svg/german-cousine-hero.svg',
    heroMobile: 'assets/images/svg/german-cousine-hero-mobile.svg',
  },
  japanese: {
    title: 'Japanese cuisine',
    label: 'Japanese recipe list',
    heroDesktop: 'assets/images/svg/japanese-cousine-hero.svg',
    heroMobile: 'assets/images/svg/japanese-cousine-hero-mobile.svg',
  },
  gourmet: {
    title: 'Gourmet cuisine',
    label: 'Gourmet recipe list',
    heroDesktop: 'assets/images/svg/gourmet-cousine-hero.svg',
    heroMobile: 'assets/images/svg/gourmet-cousine-hero-mobile.svg',
  },
  indian: {
    title: 'Indian cuisine',
    label: 'Indian recipe list',
    heroDesktop: 'assets/images/svg/indian-cousine-hero.svg',
    heroMobile: 'assets/images/svg/indian-cousine-hero-mobile.svg',
  },
  fusion: {
    title: 'Fusion cuisine',
    label: 'Fusion recipe list',
    heroDesktop: 'assets/images/svg/fusion-cousine-hero.svg',
    heroMobile: 'assets/images/svg/fusion-cousine-hero-mobile.svg',
  },
};

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
  readonly config = CATEGORY_PAGE_CONFIG[this.category];
  readonly recipes = computed(() => this.getVisibleRecipes());

  /** Returns the detail route for a recipe. */
  getRecipeDetailRoute(recipe: GeneratedRecipe): string {
    return `/${APP_ROUTES.recipeDetail.replace(':recipeId', recipe.id)}`;
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

    if (this.isRecipeCuisine(categoryId)) {
      return categoryId;
    }

    this.router.navigate([APP_ROUTES.cookbook]);
    return 'italian';
  }

  /** Checks whether a route value is a valid cuisine category. */
  private isRecipeCuisine(value: string | null): value is RecipeCuisine {
    return ['german', 'italian', 'indian', 'japanese', 'gourmet', 'fusion'].includes(value ?? '');
  }

  /** Returns visible recipes for the current category. */
  private getVisibleRecipes(): GeneratedRecipe[] {
    return this.recipeGenerationService
      .getRecipesByCuisine(this.category)
      .slice(0, CATEGORY_PAGE_SIZE);
  }

  /** Returns the readable cooking time tag. */
  private getCookingTimeTag(cookingTime: RecipeCookingTime): string {
    const labels: Record<RecipeCookingTime, string> = {
      quick: 'Quick',
      medium: 'Medium',
      complex: 'Complex',
    };

    return labels[cookingTime];
  }

  /** Returns the readable diet label. */
  private getDietLabel(diet: RecipeDiet | null): string | null {
    const labels: Record<RecipeDiet, string> = {
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
      none: 'No diet preference',
    };

    return diet && diet !== 'none' ? labels[diet] : null;
  }
}