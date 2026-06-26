import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooter } from '../../../shared/layout/legal-footer/legal-footer';

@Component({
  selector: 'app-imprint-page',
  imports: [RouterLink, LegalFooter],
  templateUrl: './imprint.page.html',
  styleUrl: './imprint.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImprintPage {
  private readonly location = inject(Location);

  /** Returns to the page visited before the imprint page. */
  goBack(): void {
    this.location.back();
  }
}