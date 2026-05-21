import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContentContainer } from '../../../shared/layout/content-container/content-container';
import { PageShell } from '../../../shared/layout/page-shell/page-shell';

@Component({
  selector: 'app-home-page',
  imports: [PageShell, ContentContainer],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}