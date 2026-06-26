import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalFooter } from '../../../shared/layout/legal-footer/legal-footer';

@Component({
    selector: 'app-privacy-page',
    imports: [RouterLink, LegalFooter],
    templateUrl: './privacy.page.html',
    styleUrl: './privacy.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {
    private readonly location = inject(Location);

    /** Returns to the page visited before the privacy page. */
    goBack(): void {
        this.location.back();
    }
}