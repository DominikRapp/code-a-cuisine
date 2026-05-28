import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type IngredientUnit = 'piece' | 'ml' | 'gram';

interface SelectedIngredient {
    id: string;
    name: string;
    amount: number;
    unit: IngredientUnit;
}

const MOCK_INGREDIENTS = [
    'Pasta',
    'Pastrami',
    'Passionfruit',
    'Potato',
    'Paprika',
    'Parmesan',
    'Apple',
    'Baby spinach',
    'Cherry tomatoes',
    'Egg',
    'Milk',
    'Rice',
    'Chicken',
] as const;

const UNIT_OPTIONS: IngredientUnit[] = ['piece', 'ml', 'gram'];

@Component({
    selector: 'app-ingredients-step-page',
    imports: [FormsModule, RouterLink],
    templateUrl: './ingredients-step.page.html',
    styleUrl: './ingredients-step.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsStepPage {
    readonly unitOptions = UNIT_OPTIONS;
    readonly ingredientName = signal('');
    readonly ingredientAmount = signal<number | null>(null);
    readonly selectedUnit = signal<IngredientUnit>('gram');
    readonly ingredients = signal<SelectedIngredient[]>([]);
    readonly editingIngredientId = signal<string | null>(null);
    readonly editName = signal('');
    readonly editAmount = signal<number | null>(null);
    readonly editUnit = signal<IngredientUnit>('gram');
    readonly suggestions = computed(() => this.getSuggestions());
    readonly autocompleteCompletion = computed(() => this.getAutocompleteCompletion());
    readonly autocompleteOffset = computed(() => 16 + this.ingredientName().length * 8.5);
    readonly canAddIngredient = computed(() => this.hasValidIngredientInput());

    /** Updates the current ingredient name input. */
    setIngredientName(value: string): void {
        this.ingredientName.set(value);
    }

    /** Updates the current ingredient amount input. */
    setIngredientAmount(value: number | null): void {
        this.ingredientAmount.set(this.toAmount(value));
    }

    /** Selects the unit for a new ingredient. */
    selectUnit(unit: IngredientUnit, dropdown: HTMLDetailsElement): void {
        this.selectedUnit.set(unit);
        dropdown.open = false;
    }

    /** Uses a suggested ingredient as the current input. */
    selectSuggestion(name: string): void {
        this.ingredientName.set(name);
    }

    /** Adds the ingredient to the visible ingredient list. */
    addIngredient(): void {
        const amount = this.toAmount(this.ingredientAmount());
        if (!this.canAddIngredient() || amount === null) {
            return;
        }
        this.ingredients.update((items) => [...items, this.createIngredient(amount)]);
        this.resetIngredientForm();
    }

    /** Starts edit mode for one ingredient row. */
    startEdit(ingredient: SelectedIngredient): void {
        this.editingIngredientId.set(ingredient.id);
        this.editAmount.set(ingredient.amount);
        this.editUnit.set(ingredient.unit);
    }

    /** Updates the currently edited ingredient amount. */
    setEditAmount(value: number | null): void {
        this.editAmount.set(this.toAmount(value));
    }

    /** Selects the unit for the edited ingredient. */
    selectEditUnit(unit: IngredientUnit, dropdown: HTMLDetailsElement): void {
        this.editUnit.set(unit);
        dropdown.open = false;
    }

    /** Saves the edited ingredient row. */
    saveEdit(ingredientId: string): void {
        const amount = this.toAmount(this.editAmount());
        if (!this.hasValidEditInput() || amount === null) {
            return;
        }
        this.ingredients.update((items) => this.updateIngredient(items, ingredientId, amount));
        this.cancelEdit();
    }

    /** Stops ingredient row edit mode. */
    cancelEdit(): void {
        this.editingIngredientId.set(null);
    }

    /** Removes one ingredient from the list. */
    deleteIngredient(ingredientId: string): void {
        this.ingredients.update((items) => items.filter((item) => item.id !== ingredientId));
        if (this.editingIngredientId() === ingredientId) {
            this.cancelEdit();
        }
    }

    /** Formats the unit for the ingredient list. */
    formatUnit(unit: IngredientUnit): string {
        if (unit === 'piece') {
            return '';
        }
        return unit === 'gram' ? 'g' : unit;
    }

    /** Focuses the first visible ingredient suggestion. */
    focusFirstSuggestion(event: Event): void {
        if (this.suggestions().length === 0) {
            return;
        }
        event.preventDefault();
        this.focusFirstElement('.ingredients-step__suggestion');
    }

    /** Opens a unit dropdown and focuses the first option. */
    focusFirstUnitOption(event: Event, dropdown: HTMLDetailsElement): void {
        event.preventDefault();
        dropdown.open = true;
        this.focusFirstDropdownOption(dropdown);
    }

    /** Moves focus between keyboard-selectable options. */
    focusAdjacentOption(event: Event, direction: number): void {
        event.preventDefault();
        const currentOption = event.currentTarget as HTMLElement | null;
        if (!currentOption) {
            return;
        }
        const options = this.getSiblingOptions(currentOption);
        const currentIndex = options.indexOf(currentOption);
        const nextIndex = this.getNextIndex(currentIndex, options.length, direction);
        options[nextIndex]?.focus();
    }

    /** Returns up to three matching ingredient suggestions. */
    private getSuggestions(): string[] {
        const search = this.ingredientName().trim().toLowerCase();
        if (!search) {
            return [];
        }
        return MOCK_INGREDIENTS.filter((name) => this.matchesSuggestion(name, search)).slice(0, 3);
    }

    /** Checks whether one ingredient matches the current search input. */
    private matchesSuggestion(name: string, search: string): boolean {
        const normalizedName = name.toLowerCase();
        return normalizedName.startsWith(search) && normalizedName !== search;
    }

    /** Returns the missing autocomplete text for the first suggestion. */
    private getAutocompleteCompletion(): string {
        const typedValue = this.ingredientName();
        const suggestion = this.suggestions()[0];
        if (!typedValue || !suggestion) {
            return '';
        }
        return suggestion.slice(typedValue.length);
    }

    /** Checks whether the add ingredient form has valid values. */
    private hasValidIngredientInput(): boolean {
        return this.ingredientName().trim().length > 0 && this.toAmount(this.ingredientAmount()) !== null;
    }

    /** Checks whether the edited ingredient amount is valid. */
    private hasValidEditInput(): boolean {
        return this.toAmount(this.editAmount()) !== null;
    }

    /** Converts an input value into a valid positive amount. */
    private toAmount(value: number | null): number | null {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount <= 0) {
            return null;
        }
        return amount;
    }

    /** Creates a selected ingredient from the current form values. */
    private createIngredient(amount: number): SelectedIngredient {
        return {
            id: crypto.randomUUID(),
            name: this.ingredientName().trim(),
            amount,
            unit: this.selectedUnit(),
        };
    }

    /** Updates one ingredient inside the selected ingredient list. */
    private updateIngredient(
        items: SelectedIngredient[],
        ingredientId: string,
        amount: number,
    ): SelectedIngredient[] {
        return items.map((item) => this.getUpdatedIngredient(item, ingredientId, amount));
    }

    /** Returns the updated ingredient when the id matches. */
    private getUpdatedIngredient(
        item: SelectedIngredient,
        ingredientId: string,
        amount: number,
    ): SelectedIngredient {
        if (item.id !== ingredientId) {
            return item;
        }
        return {
            ...item,
            amount,
            unit: this.editUnit(),
        };
    }

    /** Resets the add ingredient form to its initial state. */
    private resetIngredientForm(): void {
        this.ingredientName.set('');
        this.ingredientAmount.set(null);
        this.selectedUnit.set('gram');
    }

    /** Focuses the first element matching the given selector. */
    private focusFirstElement(selector: string): void {
        window.setTimeout(() => {
            document.querySelector<HTMLElement>(selector)?.focus();
        });
    }

    /** Focuses the first unit option inside one dropdown. */
    private focusFirstDropdownOption(dropdown: HTMLDetailsElement): void {
        window.setTimeout(() => {
            dropdown.querySelector<HTMLElement>('.ingredients-step__unit-option')?.focus();
        });
    }

    /** Returns all keyboard-selectable sibling options. */
    private getSiblingOptions(currentOption: HTMLElement): HTMLElement[] {
        const parent = currentOption.parentElement;
        if (!parent) {
            return [];
        }
        return Array.from(parent.querySelectorAll<HTMLElement>('[tabindex="0"]'));
    }

    /** Calculates the next option index for keyboard navigation. */
    private getNextIndex(currentIndex: number, optionCount: number, direction: number): number {
        if (optionCount === 0) {
            return 0;
        }
        return (currentIndex + direction + optionCount) % optionCount;
    }
}