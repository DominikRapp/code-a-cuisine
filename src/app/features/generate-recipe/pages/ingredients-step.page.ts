import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-ingredients-step-page',
    templateUrl: './ingredients-step.page.html',
    styleUrl: './ingredients-step.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsStepPage { }