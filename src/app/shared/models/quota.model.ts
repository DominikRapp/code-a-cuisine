export interface Quota {
  remainingDailyRequests: number;
  remainingSystemRequests: number;
}

export interface RecipeGenerationQuota {
  dailyIpLimit: number;
  dailySystemLimit: number;
}