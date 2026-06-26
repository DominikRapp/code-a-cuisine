import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { N8N_WORKFLOW_CONFIG } from '../config/n8n-workflow.config';
import { RecipeGenerationQuotaStatus } from '../../shared/models/quota.model';

@Injectable({
    providedIn: 'root',
})
export class N8nWorkflowService {
    private readonly http = inject(HttpClient);

    /** Starts the n8n recipe generation workflow. */
    async triggerRecipeGeneration(requestId: string): Promise<void> {
        const webhookUrl = N8N_WORKFLOW_CONFIG.recipeGenerationWebhookUrl;

        if (!webhookUrl) {
            return;
        }

        await firstValueFrom(this.http.post(webhookUrl, { requestId }));
    }

    /** Gets the current available recipe generation count. */
    async getRecipeGenerationQuotaStatus(): Promise<RecipeGenerationQuotaStatus | null> {
        const webhookUrl = N8N_WORKFLOW_CONFIG.recipeQuotaStatusWebhookUrl;

        if (!webhookUrl) {
            return null;
        }

        try {
            const status = await firstValueFrom(this.http.get<unknown>(webhookUrl));
            return this.isRecipeGenerationQuotaStatus(status) ? status : null;
        } catch {
            return null;
        }
    }

    /** Checks whether the webhook returned a valid quota status. */
    private isRecipeGenerationQuotaStatus(
        value: unknown,
    ): value is RecipeGenerationQuotaStatus {
        if (!value || typeof value !== 'object') {
            return false;
        }

        const remainingGenerations =
            (value as { remainingGenerations?: unknown }).remainingGenerations;

        return typeof remainingGenerations === 'number'
            && Number.isInteger(remainingGenerations)
            && remainingGenerations >= 0
            && remainingGenerations <= 3;
    }
}