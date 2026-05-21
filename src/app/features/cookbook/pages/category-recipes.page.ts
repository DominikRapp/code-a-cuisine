import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-category-recipes-page',
  templateUrl: './category-recipes.page.html',
  styleUrl: './category-recipes.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryRecipesPage {}