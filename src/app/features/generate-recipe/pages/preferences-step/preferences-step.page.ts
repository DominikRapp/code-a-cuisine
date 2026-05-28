import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type CookingTime = 'quick' | 'medium' | 'complex';
type Cuisine = 'german' | 'italian' | 'indian' | 'japanese' | 'gourmet' | 'fusion';
type Diet = 'vegetarian' | 'vegan' | 'keto' | 'none';

const MIN_COUNTER_VALUE = 1;
const MAX_SERVINGS = 12;
const MAX_COOKING_PERSONS = 4;

@Component({
  selector: 'app-preferences-step-page',
  imports: [RouterLink],
  templateUrl: './preferences-step.page.html',
  styleUrl: './preferences-step.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesStepPage {
  readonly servings = signal(MIN_COUNTER_VALUE);
  readonly cookingPersons = signal(MIN_COUNTER_VALUE);
  readonly cookingTime = signal<CookingTime | null>(null);
  readonly cuisine = signal<Cuisine | null>(null);
  readonly diet = signal<Diet | null>(null);

  /** Decreases the serving amount without going below one. */
  decreaseServings(): void {
    this.servings.update((value) => this.decreaseCounter(value));
  }

  /** Increases the serving amount without exceeding the allowed maximum. */
  increaseServings(): void {
    this.servings.update((value) => this.increaseCounter(value, MAX_SERVINGS));
  }

  /** Decreases the cooking person amount without going below one. */
  decreaseCookingPersons(): void {
    this.cookingPersons.update((value) => this.decreaseCounter(value));
  }

  /** Increases the cooking person amount without exceeding the allowed maximum. */
  increaseCookingPersons(): void {
    this.cookingPersons.update((value) => this.increaseCounter(value, MAX_COOKING_PERSONS));
  }

  /** Selects the preferred cooking time. */
  selectCookingTime(value: CookingTime): void {
    this.cookingTime.set(value);
  }

  /** Selects the preferred cuisine. */
  selectCuisine(value: Cuisine): void {
    this.cuisine.set(value);
  }

  /** Selects the preferred diet. */
  selectDiet(value: Diet): void {
    this.diet.set(value);
  }

  /** Checks whether the serving value is at its minimum. */
  isMinServings(): boolean {
    return this.servings() === MIN_COUNTER_VALUE;
  }

  /** Checks whether the serving value is at its maximum. */
  isMaxServings(): boolean {
    return this.servings() === MAX_SERVINGS;
  }

  /** Checks whether the cooking person value is at its minimum. */
  isMinCookingPersons(): boolean {
    return this.cookingPersons() === MIN_COUNTER_VALUE;
  }

  /** Checks whether the cooking person value is at its maximum. */
  isMaxCookingPersons(): boolean {
    return this.cookingPersons() === MAX_COOKING_PERSONS;
  }

  /** Returns the matching label for the selected serving count. */
  getServingLabel(): string {
    return this.servings() === 1 ? 'Portion' : 'Portions';
  }

  /** Returns the matching label for the selected cooking person count. */
  getCookingPersonLabel(): string {
    return this.cookingPersons() === 1 ? 'Person' : 'Persons';
  }

  /** Decreases a counter value by one and clamps it to the minimum. */
  private decreaseCounter(value: number): number {
    return Math.max(MIN_COUNTER_VALUE, value - 1);
  }

  /** Increases a counter value by one and clamps it to the maximum. */
  private increaseCounter(value: number, maxValue: number): number {
    return Math.min(maxValue, value + 1);
  }
}