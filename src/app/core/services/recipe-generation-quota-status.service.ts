import { Injectable, inject, signal } from '@angular/core';

import { N8nWorkflowService } from './n8n-workflow.service';

interface RecipeGenerationQuotaCache {
    dayKey: string;
    remainingGenerations: number;
}

const QUOTA_CACHE_KEY = 'code-a-cuisine.recipe-generation-quota';

@Injectable({
    providedIn: 'root',
})
export class RecipeGenerationQuotaStatusService {
    private readonly n8nWorkflowService = inject(N8nWorkflowService);

    readonly remainingGenerations = signal<number | null>(this.readCachedRemaining());

    /** Refreshes the quota only when today's cache still allows it. */
    async refreshIfNeeded(): Promise<void> {
        this.syncCurrentDayCache();

        if (this.remainingGenerations() === 0) {
            return;
        }

        await this.refreshQuotaStatus();
    }

    /** Refreshes the quota after a successful new recipe generation. */
    async refreshAfterSuccessfulGeneration(): Promise<void> {
        this.syncCurrentDayCache();
        await this.refreshQuotaStatus();
    }

    /** Requests the current protected quota status. */
    private async refreshQuotaStatus(): Promise<void> {
        const status = await this.n8nWorkflowService.getRecipeGenerationQuotaStatus();

        if (!status) {
            return;
        }

        this.setRemainingGenerations(status.remainingGenerations);
    }

    /** Stores and publishes a changed remaining quota value. */
    private setRemainingGenerations(remainingGenerations: number): void {
        if (this.remainingGenerations() === remainingGenerations) {
            return;
        }

        this.writeCache(remainingGenerations);
        this.remainingGenerations.set(remainingGenerations);
    }

    /** Updates the in-memory value when the UTC day has changed. */
    private syncCurrentDayCache(): void {
        const cache = this.readCache();
        const remaining = this.isCurrentDayCache(cache)
            ? cache.remainingGenerations
            : null;

        if (this.remainingGenerations() !== remaining) {
            this.remainingGenerations.set(remaining);
        }
    }

    /** Gets a valid cached remaining value for the current UTC day. */
    private readCachedRemaining(): number | null {
        const cache = this.readCache();

        return this.isCurrentDayCache(cache)
            ? cache.remainingGenerations
            : null;
    }

    /** Reads the saved quota cache record. */
    private readCache(): RecipeGenerationQuotaCache | null {
        const value = this.readStorageValue();

        if (!value) {
            return null;
        }

        return this.parseCache(value);
    }

    /** Reads one value from local storage safely. */
    private readStorageValue(): string | null {
        try {
            return localStorage.getItem(QUOTA_CACHE_KEY);
        } catch {
            return null;
        }
    }

    /** Parses one stored cache record safely. */
    private parseCache(value: string): RecipeGenerationQuotaCache | null {
        try {
            const cache = JSON.parse(value) as unknown;

            return this.isValidCache(cache) ? cache : null;
        } catch {
            return null;
        }
    }

    /** Checks whether one cache record has the expected shape. */
    private isValidCache(value: unknown): value is RecipeGenerationQuotaCache {
        if (!value || typeof value !== 'object') {
            return false;
        }

        const record = value as Record<string, unknown>;

        return typeof record['dayKey'] === 'string'
            && Number.isInteger(record['remainingGenerations'])
            && Number(record['remainingGenerations']) >= 0
            && Number(record['remainingGenerations']) <= 3;
    }

    /** Checks whether a cache record belongs to the current UTC day. */
    private isCurrentDayCache(cache: RecipeGenerationQuotaCache | null): cache is RecipeGenerationQuotaCache {
        return cache?.dayKey === this.getUtcDayKey();
    }

    /** Saves the current remaining quota for the active UTC day. */
    private writeCache(remainingGenerations: number): void {
        const cache = {
            dayKey: this.getUtcDayKey(),
            remainingGenerations,
        };

        try {
            localStorage.setItem(QUOTA_CACHE_KEY, JSON.stringify(cache));
        } catch {
            return;
        }
    }

    /** Returns the current UTC day key used by the quota workflow. */
    private getUtcDayKey(): string {
        return new Date().toISOString().slice(0, 10);
    }
}