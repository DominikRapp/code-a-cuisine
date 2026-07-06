import { environment } from '../../../environments/environment';

export const N8N_WORKFLOW_CONFIG = {
    recipeGenerationWebhookUrl: environment.n8n.recipeGenerationWebhookUrl,
} as const;