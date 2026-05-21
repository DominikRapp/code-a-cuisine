import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-recipe-detail-page',
  templateUrl: './recipe-detail.page.html',
  styleUrl: './recipe-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetailPage {}