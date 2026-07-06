import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecipeGenerationService } from '../../../../core/services/recipe-generation.service';
import { RecipeGenerationQuotaStatusService } from '../../../../core/services/recipe-generation-quota-status.service';
import { IngredientSuggestionService } from '../../../../core/services/ingredient-suggestion.service';
import { RECIPE_INGREDIENT_UNIT_OPTIONS } from '../../../../shared/data/recipe-ingredient-options.data';
import {
    createRecipeIngredient,
    getVisibleIngredientUnitLabel,
    hasIngredientName,
    INGREDIENT_AMOUNT_MAX_DIGITS,
    sanitizeIngredientAmountInput,
    sanitizeIngredientNameInput,
    toIngredientAmount,
    updateRecipeIngredientAmountAndUnit,
} from '../../../../shared/utils/ingredient.util';
import { RecipeIngredient, RecipeIngredientUnit } from '../../../../shared/models/recipe-generation.model';
import { RECIPE_GENERATION_CONFIG } from '../../../../core/config/recipe-generation.config';
import { LegalFooter } from '../../../../shared/layout/legal-footer/legal-footer';

@Component({
    selector: 'app-ingredients-step-page',
    imports: [FormsModule, RouterLink, LegalFooter],
    templateUrl: './ingredients-step.page.html',
    styleUrl: './ingredients-step.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsStepPage implements OnInit {
    private readonly recipeGenerationService = inject(RecipeGenerationService);
    private readonly recipeGenerationQuotaStatusService = inject(
        RecipeGenerationQuotaStatusService,
    );
    private readonly ingredientSuggestionService = inject(IngredientSuggestionService);
    private readonly minIngredientCount = RECIPE_GENERATION_CONFIG.ingredients.minCount;

    readonly amountMaxLength = INGREDIENT_AMOUNT_MAX_DIGITS;
    readonly unitOptions = RECIPE_INGREDIENT_UNIT_OPTIONS;
    readonly ingredientName = signal('');
    readonly ingredientSuggestionsVisible = signal(false);
    readonly ingredientAmount = signal<number | null>(null);
    readonly selectedUnit = signal<RecipeIngredientUnit>('gram');
    readonly ingredients = signal<RecipeIngredient[]>([]);
    readonly editingIngredientId = signal<string | null>(null);
    readonly editAmount = signal<number | null>(null);
    readonly editUnit = signal<RecipeIngredientUnit>('gram');
    readonly suggestions = computed(() =>
        this.ingredientSuggestionsVisible() ? this.getSuggestions() : [],
    );
    readonly autocompleteCompletion = computed(() => this.getAutocompleteCompletion());
    readonly canAddIngredient = computed(() => this.hasValidIngredientInput());
    readonly canContinueToPreferences = computed(() => this.hasRequiredIngredientCount());
    readonly missingIngredientCount = computed(() => this.getMissingIngredientCount());
    readonly remainingGenerations = this.recipeGenerationQuotaStatusService.remainingGenerations;

    /** Restores the current ingredient list and refreshes the quota without blocking the page. */
    ngOnInit(): void {
        this.ingredients.set(this.recipeGenerationService.getIngredients());
        void this.recipeGenerationQuotaStatusService.refreshIfNeeded();
    }

    /** Saves the selected ingredients for the preferences step. */
    saveIngredients(event?: Event): void {
        if (!this.canContinueToPreferences()) {
            event?.preventDefault();
            return;
        }

        this.persistIngredients();
    }

    /** Updates the current ingredient name input. */
    setIngredientName(event: Event): void {
        const input = event.target as HTMLInputElement | null;

        if (!input) {
            return;
        }

        input.value = sanitizeIngredientNameInput(input.value);
        this.ingredientName.set(input.value);
    }

    /** Shows ingredient suggestions while focus stays inside the ingredient input area. */
    showIngredientSuggestions(): void {
        this.ingredientSuggestionsVisible.set(true);
    }

    /** Hides ingredient suggestions after focus leaves the ingredient input area. */
    hideIngredientSuggestionsWhenFocusLeaves(event: FocusEvent): void {
        const nextTarget = event.relatedTarget as HTMLElement | null;

        if (nextTarget?.closest('.ingredients-step__ingredient-group')) {
            return;
        }

        this.ingredientSuggestionsVisible.set(false);
    }

    /** Updates the current ingredient amount input. */
    setIngredientAmount(event: Event): void {
        this.ingredientAmount.set(this.getSanitizedAmountFromEvent(event));
    }

    /** Selects the unit for a new ingredient. */
    selectUnit(unit: RecipeIngredientUnit, dropdown: HTMLDetailsElement): void {
        this.selectedUnit.set(unit);
        dropdown.open = false;
    }

    /** Uses a suggested ingredient and keeps focus in the ingredient input. */
    selectSuggestion(
        event: Event,
        name: string,
        ingredientNameInput: HTMLInputElement,
    ): void {
        event.preventDefault();
        this.ingredientName.set(name);
        ingredientNameInput.focus();
    }

    /** Adds the ingredient to the visible ingredient list. */
    addIngredient(): void {
        const amount = toIngredientAmount(this.ingredientAmount());
        if (!this.canAddIngredient() || amount === null) {
            return;
        }
        this.ingredients.update((items) => [...items, this.createIngredient(amount)]);
        this.persistIngredients();
        this.resetIngredientForm();
    }

    /** Starts edit mode for one ingredient row. */
    startEdit(ingredient: RecipeIngredient): void {
        this.editingIngredientId.set(ingredient.id);
        this.editAmount.set(ingredient.amount);
        this.editUnit.set(ingredient.unit);
    }

    /** Updates the currently edited ingredient amount. */
    setEditAmount(event: Event): void {
        this.editAmount.set(this.getSanitizedAmountFromEvent(event));
    }

    /** Selects the unit for the edited ingredient. */
    selectEditUnit(unit: RecipeIngredientUnit, dropdown: HTMLDetailsElement): void {
        this.editUnit.set(unit);
        dropdown.open = false;
    }

    /** Saves the edited ingredient row. */
    saveEdit(ingredientId: string): void {
        const amount = toIngredientAmount(this.editAmount());
        if (!this.hasValidEditInput() || amount === null) {
            return;
        }
        this.ingredients.update((items) =>
            items.map((item) =>
                updateRecipeIngredientAmountAndUnit(item, ingredientId, amount, this.editUnit()),
            ),
        );
        this.persistIngredients();
        this.cancelEdit();
    }

    /** Stops ingredient row edit mode and resets edit values. */
    cancelEdit(): void {
        this.editingIngredientId.set(null);
        this.editAmount.set(null);
        this.editUnit.set('gram');
    }

    /** Removes one ingredient from the list. */
    deleteIngredient(ingredientId: string): void {
        this.ingredients.update((items) => items.filter((item) => item.id !== ingredientId));
        this.persistIngredients();

        if (this.editingIngredientId() === ingredientId) {
            this.cancelEdit();
        }
    }

    /** Returns the visible unit label for the ingredient list. */
    getVisibleUnitLabel(unit: RecipeIngredientUnit): string {
        return getVisibleIngredientUnitLabel(unit);
    }

    /** Returns the minimum ingredient hint text. */
    getMinimumIngredientHint(): string {
        const missingCount = this.missingIngredientCount();

        return `Add at least ${missingCount} more ingredient${missingCount === 1 ? '' : 's'} to continue.`;
    }

    /** Focuses the first visible ingredient suggestion. */
    focusFirstSuggestion(event: Event): void {
        if (this.suggestions().length === 0) {
            return;
        }
        event.preventDefault();
        this.focusFirstElement('.ingredients-step__suggestion');
    }

    /** Moves through ingredient suggestions and returns to the input above the first suggestion. */
    focusAdjacentSuggestion(
        event: Event,
        direction: number,
        ingredientNameInput: HTMLInputElement,
    ): void {
        event.preventDefault();

        const currentSuggestion = event.currentTarget as HTMLElement | null;

        if (!currentSuggestion) {
            return;
        }

        const suggestions = this.getSiblingOptions(currentSuggestion);
        const currentIndex = suggestions.indexOf(currentSuggestion);

        if (currentIndex === -1) {
            return;
        }

        if (direction < 0 && currentIndex === 0) {
            ingredientNameInput.focus();
            return;
        }

        const nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= suggestions.length) {
            return;
        }

        suggestions[nextIndex]?.focus();
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

    /** Returns matching ingredient suggestions from the suggestion service. */
    private getSuggestions(): string[] {
        return this.ingredientSuggestionService.getSuggestions(this.ingredientName());
    }

    /** Returns the missing autocomplete text for the first suggestion. */
    private getAutocompleteCompletion(): string {
        return this.ingredientSuggestionService.getAutocompleteCompletion(
            this.ingredientName(),
            this.suggestions(),
        );
    }

    /** Checks whether the add ingredient form has valid values. */
    private hasValidIngredientInput(): boolean {
        return (
            hasIngredientName(this.ingredientName()) &&
            toIngredientAmount(this.ingredientAmount()) !== null
        );
    }

    /** Checks whether the edited ingredient amount is valid. */
    private hasValidEditInput(): boolean {
        return toIngredientAmount(this.editAmount()) !== null;
    }

    /** Returns the sanitized amount from an input event. */
    private getSanitizedAmountFromEvent(event: Event): number | null {
        const input = event.target as HTMLInputElement | null;

        if (!input) {
            return null;
        }

        const amount = sanitizeIngredientAmountInput(input.value);
        input.value = amount === null ? '' : String(amount);

        return amount;
    }

    /** Creates a selected ingredient from the current form values. */
    private createIngredient(amount: number): RecipeIngredient {
        return createRecipeIngredient(this.ingredientName(), amount, this.selectedUnit());
    }

    /** Keeps the active ingredient draft in sync while navigating between steps. */
    private persistIngredients(): void {
        this.recipeGenerationService.setIngredients(this.ingredients());
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

    /** Checks whether enough ingredients were added. */
    private hasRequiredIngredientCount(): boolean {
        return this.ingredients().length >= this.minIngredientCount;
    }

    /** Returns how many ingredients are still missing. */
    private getMissingIngredientCount(): number {
        return Math.max(this.minIngredientCount - this.ingredients().length, 0);
    }
}