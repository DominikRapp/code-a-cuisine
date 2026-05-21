import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-page',
  templateUrl: './loading.page.html',
  styleUrl: './loading.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingPage {}