import { Injectable, signal } from '@angular/core';
import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { MOCK_INGREDIENT_SUGGESTIONS } from '../../shared/data/mock/ingredient-suggestions.mock-data';

@Injectable({
    providedIn: 'root',
})
export class IngredientSuggestionService {
    private readonly maxSuggestions = RECIPE_GENERATION_CONFIG.ingredients.maxSuggestions;
    private readonly suggestions = signal<string[]>(this.loadSuggestions());

    /** Returns matching ingredient suggestions up to the configured limit. */
    getSuggestions(value: string): string[] {
        const search = value.trim().toLowerCase();

        if (!search) {
            return [];
        }

        return this.suggestions()
            .filter((name) => this.matchesSuggestion(name, search))
            .slice(0, this.maxSuggestions);
    }

    /** Returns the missing autocomplete text for the first suggestion. */
    getAutocompleteCompletion(value: string, suggestions: string[]): string {
        const suggestion = suggestions[0];

        if (!value || !suggestion) {
            return '';
        }

        return suggestion.slice(value.length);
    }

    /** Loads ingredient suggestions from the current suggestion source. */
    private loadSuggestions(): string[] {
        return [...MOCK_INGREDIENT_SUGGESTIONS];
    }

    /** Checks whether one ingredient matches the current search input. */
    private matchesSuggestion(name: string, search: string): boolean {
        const normalizedName = name.toLowerCase();
        return normalizedName.startsWith(search) && normalizedName !== search;
    }
}