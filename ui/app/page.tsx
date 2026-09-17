'use client';
import { useState } from 'react';
import { AnalyzeRiskResponse } from '../../shared/types';
import styles from './Home.module.css';

export default function Home() {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalyzeRiskResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:4000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
            });

            if (!res.ok) throw new Error('Failed to analyze risk');

            const data: AnalyzeRiskResponse = await res.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getRiskLevelClass = (level: string) => {
        switch (level) {
            case 'High':
                return styles.riskHigh;
            case 'Medium':
                return styles.riskMedium;
            default:
                return styles.riskLow;
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Change Risk Analyser</h1>
                    <p className={styles.subtitle}>
                        Evaluate the impact and risk level of your software updates instantly.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.label}>
                            Change Description
                        </label>
                        <textarea
                            id="description"
                            className={styles.textarea}
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your proposed software change..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.button}
                    >
                        {loading ? 'Analyzing Risk...' : 'Analyze Risk'}
                    </button>
                </form>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {result && (
                    <div className={styles.result}>
                        <div className={styles.resultHeader}>
                            <h2 className={styles.resultLabel}>Risk Level</h2>
                            <span className={`${styles.riskBadge} ${getRiskLevelClass(result.riskLevel)}`}>
                                {result.riskLevel}
                            </span>
                        </div>

                        <div>
                            <h2 className={styles.sectionTitle}>Impacted Areas</h2>
                            <ul className={styles.list}>
                                {result.impactedAreas.map((area, idx) => (
                                    <li key={idx} className={styles.listItem}>
                                        <span className={styles.bullet}>•</span>
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className={styles.sectionTitle}>Recommended Testing</h2>
                            <ul className={styles.list}>
                                {result.recommendedTesting.map((test, idx) => (
                                    <li key={idx} className={styles.listItem}>
                                        <span className={styles.bullet}>•</span>
                                        {test}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}