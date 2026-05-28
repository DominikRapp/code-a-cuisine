import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-results-page',
  templateUrl: './results.page.html',
  styleUrl: './results.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPage {}