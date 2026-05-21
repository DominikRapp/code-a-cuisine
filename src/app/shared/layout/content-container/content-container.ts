import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-content-container',
  templateUrl: './content-container.html',
  styleUrl: './content-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentContainer {}