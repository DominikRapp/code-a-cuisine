import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-legal-footer',
    imports: [RouterLink],
    templateUrl: './legal-footer.html',
    styleUrl: './legal-footer.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalFooter { }