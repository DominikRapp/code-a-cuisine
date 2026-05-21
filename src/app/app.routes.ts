import { Routes } from '@angular/router';

import { APP_ROUTES } from './core/config/app-routes.config';

export const routes: Routes = [
    {
        path: APP_ROUTES.home,
        loadComponent: () =>
            import('./features/home/pages/home.page').then((m) => m.HomePage),
    },
    {
        path: APP_ROUTES.generateIngredients,
        loadComponent: () =>
            import('./features/generate-recipe/pages/ingredients-step.page').then(
                (m) => m.IngredientsStepPage,
            ),
    },
    {
        path: APP_ROUTES.generatePreferences,
        loadComponent: () =>
            import('./features/generate-recipe/pages/preferences-step.page').then(
                (m) => m.PreferencesStepPage,
            ),
    },
    {
        path: APP_ROUTES.generateLoading,
        loadComponent: () =>
            import('./features/generate-recipe/pages/loading.page').then(
                (m) => m.LoadingPage,
            ),
    },
    {
        path: APP_ROUTES.generateResults,
        loadComponent: () =>
            import('./features/generate-recipe/pages/results.page').then(
                (m) => m.ResultsPage,
            ),
    },
    {
        path: APP_ROUTES.recipeDetail,
        loadComponent: () =>
            import('./features/recipe/pages/recipe-detail.page').then(
                (m) => m.RecipeDetailPage,
            ),
    },
    {
        path: APP_ROUTES.cookbook,
        loadComponent: () =>
            import('./features/cookbook/pages/cookbook.page').then(
                (m) => m.CookbookPage,
            ),
    },
    {
        path: APP_ROUTES.cookbookCategory,
        loadComponent: () =>
            import('./features/cookbook/pages/category-recipes.page').then(
                (m) => m.CategoryRecipesPage,
            ),
    },
    {
        path: APP_ROUTES.imprint,
        loadComponent: () =>
            import('./features/legal/pages/imprint.page').then((m) => m.ImprintPage),
    },
    {
        path: '**',
        redirectTo: APP_ROUTES.home,
    },
];