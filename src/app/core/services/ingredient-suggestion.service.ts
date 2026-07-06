import { Injectable, signal } from '@angular/core';
import { get, ref } from 'firebase/database';
import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { FIREBASE_PATHS } from '../config/firebase-paths.config';
import { getFirebaseDatabase } from '../firebase/firebase.config';
import { FirebaseIngredientSuggestionRecord } from '../../shared/models/firebase-database.model';

@Injectable({
    providedIn: 'root',
})
export class IngredientSuggestionService {
    private readonly maxSuggestions = RECIPE_GENERATION_CONFIG.ingredients.maxSuggestions;
    private readonly suggestions = signal<string[]>([]);

    constructor() {
        void this.loadFirebaseSuggestions();
    }

    /** Returns matching ingredient suggestions up to the configured limit. */
    getSuggestions(value: string): string[] {
        const search = value.toLowerCase();

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

    /** Loads approved ingredient suggestions from Firebase. */
    private async loadFirebaseSuggestions(): Promise<void> {
        try {
            const snapshot = await get(ref(getFirebaseDatabase(), FIREBASE_PATHS.ingredientSuggestions));
            this.suggestions.set(this.mapSuggestionNames(snapshot.val()));
        } catch {
            this.suggestions.set([]);
        }
    }

    /** Maps Firebase suggestion records to display names. */
    private mapSuggestionNames(value: unknown): string[] {
        if (!value || typeof value !== 'object') {
            return [];
        }

        return Object.values(value as Record<string, FirebaseIngredientSuggestionRecord>)
            .filter((record) => record.approved)
            .map((record) => record.displayName)
            .sort();
    }

    /** Checks whether one ingredient matches the current search input. */
    private matchesSuggestion(name: string, search: string): boolean {
        const normalizedName = name.toLowerCase();
        return normalizedName.startsWith(search) && normalizedName !== search;
    }
}