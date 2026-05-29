import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { APP_ROUTES } from '../../../../core/config/app-routes.config';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import { MOCK_GENERATION_DELAY_MS } from '../../../../shared/data/mock/generation-flow.mock-data';

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
  private loadingTimeoutId: number | null = null;

  readonly showErrorPopup = signal(false);

  constructor() {
    this.startMockGeneration();
  }

  /** Clears pending loading actions when the page is destroyed. */
  ngOnDestroy(): void {
    this.clearLoadingTimeout();
  }

  /** Hides the current loading error popup. */
  closeErrorPopup(): void {
    this.showErrorPopup.set(false);
  }

  /** Starts the temporary mock generation flow. */
  private startMockGeneration(): void {
    const request = this.recipeGenerationService.getRequest();

    if (!request) {
      this.router.navigate([APP_ROUTES.generateIngredients]);
      return;
    }

    this.loadingTimeoutId = window.setTimeout(() => {
      this.recipeGenerationService.createMockRecipes();
      this.router.navigate([APP_ROUTES.generateResults]);
    }, MOCK_GENERATION_DELAY_MS);
  }

  /** Clears the active mock loading timeout. */
  private clearLoadingTimeout(): void {
    if (this.loadingTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.loadingTimeoutId);
    this.loadingTimeoutId = null;
  }
}