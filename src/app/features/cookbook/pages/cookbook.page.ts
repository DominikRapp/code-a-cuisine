import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cookbook-page',
  templateUrl: './cookbook.page.html',
  styleUrl: './cookbook.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookbookPage {}