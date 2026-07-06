import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import { RECIPE_GENERATION_CONFIG } from '../../../../core/config/recipe-generation.config';
import { RecipeGenerationResult } from '../../../../shared/models/recipe-generation.model';

@Component({
  selector: 'app-loading-page',
  imports: [RouterLink],
  templateUrl: './loading.page.html',
  styleUrl: './loading.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingPage implements OnDestroy {
  private readonly recipeGenerationService = inject(RecipeGenerationService);
  private readonly router = inject(Router);
  private isActive = true;

  readonly showErrorPopup = signal(false);

  constructor() {
    void this.startGeneration();
  }

  /** Stops pending page actions after destroy. */
  ngOnDestroy(): void {
    this.isActive = false;
  }

  /** Returns to the ingredient step while keeping the current ingredient draft. */
  returnToIngredients(): void {
    this.showErrorPopup.set(false);
    void this.router.navigate([APP_ROUTES.generateIngredients]);
  }

  /** Starts generation and keeps the loader visible long enough. */
  private async startGeneration(): Promise<void> {
    if (!this.recipeGenerationService.hasRequest()) {
      this.router.navigate([APP_ROUTES.generateIngredients]);
      return;
    }

    const [result] = await Promise.all([
      this.recipeGenerationService.generateRecipes(),
      this.waitMinimumLoadingTime(),
    ]);

    this.handleGenerationResult(result);
  }

  /** Waits for the configured minimum loading time. */
  private waitMinimumLoadingTime(): Promise<void> {
    return new Promise((resolve) =>
      window.setTimeout(resolve, RECIPE_GENERATION_CONFIG.loading.delayMs),
    );
  }

  /** Handles the finished generation result. */
  private handleGenerationResult(result: RecipeGenerationResult): void {
    if (!this.isActive) {
      return;
    }

    if (result.status === 'success') {
      this.router.navigate([APP_ROUTES.generateResults]);
      return;
    }

    this.showErrorPopup.set(true);
  }
}