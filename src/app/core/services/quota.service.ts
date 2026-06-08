import { Injectable } from '@angular/core';

import { RECIPE_GENERATION_CONFIG } from '../config/recipe-generation.config';
import { RecipeGenerationQuota } from '../../shared/models/quota.model';

@Injectable({
  providedIn: 'root',
})
export class QuotaService {
  /** Returns the configured recipe generation quota limits. */
  getRecipeGenerationQuota(): RecipeGenerationQuota {
    return {
      dailyIpLimit: RECIPE_GENERATION_CONFIG.quota.perIpPerDay,
      dailySystemLimit: RECIPE_GENERATION_CONFIG.quota.systemPerDay,
    };
  }
}