import { describe, it, expect } from 'vitest';
import { analyzeChangeRisk } from './analyzer';
import type { AnalyzeRiskRequest } from '@dev-interview-challenge/shared';

const analyze = (description: string) =>
  analyzeChangeRisk({ description } as AnalyzeRiskRequest);

describe('analyzeChangeRisk', () => {
  describe('input handling', () => {
    it('returns Low with Unspecified for empty input', () => {
      const result = analyze('');
      expect(result.riskLevel).toBe('Low');
      expect(result.impactedAreas).toEqual(['Unspecified']);
    });

    it('treats whitespace-only input as empty', () => {
      const result = analyze('   \n  ');
      expect(result.riskLevel).toBe('Low');
      expect(result.impactedAreas).toEqual(['Unspecified']);
    });

    it('returns Low with General Core Logic for unmatched input', () => {
      const result = analyze('Refactor a helper function for date parsing.');
      expect(result.riskLevel).toBe('Low');
      expect(result.impactedAreas).toEqual(['General Core Logic']);
    });
  });

  describe('risk level assignment', () => {
    it('flags authentication changes as High', () => {
      const result = analyze('Update the login flow to support MFA.');
      expect(result.riskLevel).toBe('High');
      expect(result.impactedAreas).toContain(
        'Authentication, Access Control & Security',
      );
    });

    it('flags payment changes as High', () => {
      const result = analyze('Add Stripe checkout for subscription upgrades.');
      expect(result.riskLevel).toBe('High');
      expect(result.impactedAreas).toContain('Payment & Financial Transactions');
    });

    it('flags database migrations as High', () => {
      const result = analyze('Add a new column to the users table.');
      expect(result.riskLevel).toBe('High');
      expect(result.impactedAreas).toContain('Data Layer & Persistence');
    });

    it('flags API changes as Medium when no High rule matches', () => {
      const result = analyze('Add a new endpoint to the catalog service.');
      expect(result.riskLevel).toBe('Medium');
      expect(result.impactedAreas).toContain('API Services & Integrations');
    });

    it('flags UI-only changes as Low', () => {
      const result = analyze('Adjust button spacing on the settings page.');
      expect(result.riskLevel).toBe('Low');
      expect(result.impactedAreas).toContain(
        'User Interface & Frontend Experience',
      );
    });

    it('picks the highest level when rules of different levels match', () => {
      // UI (Low) + auth (High) -> High
      const result = analyze('Restyle the login form and update the auth flow.');
      expect(result.riskLevel).toBe('High');
    });
  });

  describe('multi-word and punctuation keywords', () => {
    it('matches "third-party" inside a sentence', () => {
      const result = analyze('Integrate a third-party analytics SDK.');
      expect(result.impactedAreas).toContain('API Services & Integrations');
    });

    it('matches "ci/cd" inside a sentence', () => {
      const result = analyze('Update the ci/cd pipeline to run on push.');
      expect(result.impactedAreas).toContain(
        'Infrastructure, Deployment & Configuration',
      );
    });

    it('matches "credit card" as a phrase', () => {
      const result = analyze('Store credit card tokens securely.');
      expect(result.impactedAreas).toContain('Payment & Financial Transactions');
    });
  });

  describe('output shape and de-duplication', () => {
    it('de-duplicates impacted areas across rules', () => {
      // "cache" appears in both database_persistence and performance_caching
      const result = analyze('Tune the cache layer for better throughput.');
      const areas = result.impactedAreas;
      expect(new Set(areas).size).toBe(areas.length);
    });

    it('de-duplicates recommended testing across rules', () => {
      const result = analyze('Update the auth token and session handling.');
      const tests = result.recommendedTesting;
      expect(new Set(tests).size).toBe(tests.length);
    });

    it('returns at least one impacted area and one test for matched input', () => {
      const result = analyze('Update the authentication flow.');
      expect(result.impactedAreas.length).toBeGreaterThan(0);
      expect(result.recommendedTesting.length).toBeGreaterThan(0);
    });
  });
});