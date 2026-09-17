export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface AnalyzeRiskRequest {
    description: string;
}

export interface AnalyzeRiskResponse {
    riskLevel: RiskLevel;
    impactedAreas: string[];
    recommendedTesting: string[];
}