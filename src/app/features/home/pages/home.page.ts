import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentContainer } from '../../../shared/layout/content-container/content-container';
import { PageShell } from '../../../shared/layout/page-shell/page-shell';
import { RecipeGenerationService } from '../../../core/services/recipe-generation.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, PageShell, ContentContainer],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly recipeGenerationService = inject(RecipeGenerationService);

  /** Clears previous results before the user starts a new recipe flow. */
  startNewRecipe(): void {
    this.recipeGenerationService.startNewRecipe();
  }
}