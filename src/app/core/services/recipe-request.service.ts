import { Injectable } from '@angular/core';
import { get, push, ref, set } from 'firebase/database';
import { FIREBASE_PATHS } from '../config/firebase-paths.config';
import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { getFirebaseDatabase } from '../firebase/firebase.config';
import { mapRecipeRequestToFirebase } from '../../shared/mappers/firebase-recipe.mapper';
import { FirebaseRecipeRequestRecord } from '../../shared/models/firebase-recipe.model';
import { RecipeGenerationRequest } from '../../shared/models/recipe-generation.model';

@Injectable({
    providedIn: 'root',
})
export class RecipeRequestService {
    /** Writes one generation request to Firebase for the future n8n workflow. */
    async createRequest(request: RecipeGenerationRequest): Promise<string> {
        const requestRef = push(ref(getFirebaseDatabase(), FIREBASE_PATHS.recipeRequests));
        const requestId = requestRef.key;

        if (!requestId) {
            throw new Error('Missing Firebase request id.');
        }

        await set(requestRef, mapRecipeRequestToFirebase(request));

        return requestId;
    }

    /** Reads one generation request status from Firebase. */
    async readRequest(requestId: string): Promise<FirebaseRecipeRequestRecord | null> {
        const snapshot = await get(ref(getFirebaseDatabase(), `${FIREBASE_PATHS.recipeRequests}/${requestId}`));
        return snapshot.val() as FirebaseRecipeRequestRecord | null;
    }

    /** Returns generated recipe ids first, then matched recipe ids. */
    getResultRecipeIds(record: FirebaseRecipeRequestRecord): string[] {
        const generatedIds = record.generatedRecipeIds ?? [];
        const matchedIds = record.matchedRecipeIds ?? [];

        return [...new Set([...generatedIds, ...matchedIds])];
    }

    /** Checks whether a request has a final workflow status. */
    isFinalStatus(record: FirebaseRecipeRequestRecord): boolean {
        return ['completed', 'matched', 'generated', 'failed', 'quotaExceeded'].includes(
            record.status,
        );
    }

    /** Waits until n8n writes a final request status. */
    async waitForFinalRequest(requestId: string): Promise<FirebaseRecipeRequestRecord | null> {
        const startedAt = Date.now();

        while (this.canKeepWaiting(startedAt)) {
            const record = await this.readRequest(requestId);

            if (record && this.isFinalStatus(record)) {
                return record;
            }

            await this.waitForStatusPoll();
        }

        return null;
    }

    /** Checks whether request polling can continue. */
    private canKeepWaiting(startedAt: number): boolean {
        return Date.now() - startedAt < RECIPE_GENERATION_CONFIG.workflow.maxWaitMs;
    }

    /** Waits before reading the request status again. */
    private waitForStatusPoll(): Promise<void> {
        return new Promise((resolve) =>
            window.setTimeout(resolve, RECIPE_GENERATION_CONFIG.workflow.pollIntervalMs),
        );
    }
}