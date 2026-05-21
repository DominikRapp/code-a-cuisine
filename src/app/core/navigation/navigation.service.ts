import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { APP_ROUTES } from '../config/app-routes.config';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    constructor(private readonly router: Router) { }

    /**
     * Navigates to the home page.
     */
    goToHome(): void {
        void this.router.navigate([APP_ROUTES.home]);
    }

    /**
     * Navigates to the ingredient input page.
     */
    goToIngredientStep(): void {
        void this.router.navigate([APP_ROUTES.generateIngredients]);
    }

    /**
     * Navigates to the recipe preferences page.
     */
    goToPreferencesStep(): void {
        void this.router.navigate([APP_ROUTES.generatePreferences]);
    }

    /**
     * Navigates to the recipe loading page.
     */
    goToLoadingStep(): void {
        void this.router.navigate([APP_ROUTES.generateLoading]);
    }

    /**
     * Navigates to the generated recipe results page.
     */
    goToResultsStep(): void {
        void this.router.navigate([APP_ROUTES.generateResults]);
    }

    /**
     * Navigates to the cookbook page.
     */
    goToCookbook(): void {
        void this.router.navigate([APP_ROUTES.cookbook]);
    }

    /**
     * Navigates to the imprint page.
     */
    goToImprint(): void {
        void this.router.navigate([APP_ROUTES.imprint]);
    }

    /**
     * Navigates to the previous browser history entry.
     */
    goBack(): void {
        window.history.back();
    }
}