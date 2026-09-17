import { AnalyzeRiskRequest, AnalyzeRiskResponse, RiskLevel } from "@dev-interview-challenge/shared";

interface Rule {
    id: string;
    keywords: string[];
    riskLevel: RiskLevel;
    impactedArea: string;
    testingActivities: string[];
}

const RULES: Rule[] = [
    {
        id: 'auth_security',
        keywords: [
            'auth', 'authenticate', 'authentication', 'login', 'logout', 'mfa', '2fa', 
            'password', 'token', 'jwt', 'session', 'role', 'permission', 'rbac', 'oauth', 
            'saml', 'sso', 'admin', 'privilege', 'gdpr', 'pii', 'encrypt', 'encryption'
        ],
        riskLevel: 'High',
        impactedArea: 'Authentication, Access Control & Security',
        testingActivities: [
            'Perform security regression testing on authentication flows.',
            'Verify session termination and token invalidation logic.',
            'Test for unauthorized privilege escalation and endpoint authorization.'
        ]
    },
    {
        id: 'payment_billing',
        keywords: [
            'payment', 'stripe', 'billing', 'credit card', 'invoice', 'checkout', 
            'subscription', 'refund', 'charge', 'currency', 'tax', 'cart', 'transaction'
        ],
        riskLevel: 'High',
        impactedArea: 'Payment & Financial Transactions',
        testingActivities: [
            'Execute end-to-end payment scenarios in sandbox mode.',
            'Verify webhook responses, failure retries, and error handling.',
            'Confirm idempotency for payment retry attempts.'
        ]
    },
    {
        id: 'database_persistence',
        keywords: [
            'database', 'db', 'migration', 'schema', 'sql', 'query', 'postgres', 'mysql', 
            'mongo', 'prisma', 'orm', 'index', 'table', 'column', 'redis', 'cache', 'entity'
        ],
        riskLevel: 'High',
        impactedArea: 'Data Layer & Persistence',
        testingActivities: [
            'Test database migration and rollback scripts in staging.',
            'Audit query execution plans and index usage for potential performance hits.',
            'Validate data integrity and field constraints before and after migration.'
        ]
    },
    {
        id: 'infrastructure_devops',
        keywords: [
            'deploy', 'docker', 'kubernetes', 'k8s', 'terraform', 'aws', 'azure', 'gcp', 
            'ci/cd', 'pipeline', 'env', 'config', 'environment variable', 'secrets', 'dns', 'nginx'
        ],
        riskLevel: 'High',
        impactedArea: 'Infrastructure, Deployment & Configuration',
        testingActivities: [
            'Verify configuration parameter loading across staging and production contexts.',
            'Conduct deployment smoke testing in isolated environment environments.',
            'Validate rollback procedures and environment secret propagation.'
        ]
    },
    {
        id: 'background_async',
        keywords: [
            'queue', 'job', 'worker', 'cron', 'task', 'kafka', 'rabbitmq', 'sqs', 
            'background', 'async', 'batch', 'schedule', 'event'
        ],
        riskLevel: 'Medium',
        impactedArea: 'Asynchronous Processing & Messaging',
        testingActivities: [
            'Verify job processing queue retry limits and dead-letter queue routing.',
            'Validate task execution idempotency under concurrent execution.',
            'Monitor worker memory consumption and execution timeout behavior.'
        ]
    },
    {
        id: 'api_integration',
        keywords: [
            'api', 'endpoint', 'rest', 'graphql', 'webhook', 'payload', 'route', 
            'contract', 'microservice', 'grpc', 'third-party', 'sdk'
        ],
        riskLevel: 'Medium',
        impactedArea: 'API Services & Integrations',
        testingActivities: [
            'Run contract tests against modified API endpoints.',
            'Verify backward compatibility for existing public/private consumers.',
            'Validate request input sanitization, headers, and error payload formatting.'
        ]
    },
    {
        id: 'notifications_messaging',
        keywords: [
            'email', 'notification', 'sms', 'push', 'slack', 'sendgrid', 'twilio', 'template', 'mail'
        ],
        riskLevel: 'Medium',
        impactedArea: 'Notifications & Messaging System',
        testingActivities: [
            'Verify notification triggers across target user lifecycle events.',
            'Validate template string rendering, dynamic variables, and fallback formatting.',
            'Test rate-limiting and external provider error handoffs.'
        ]
    },
    {
        id: 'performance_caching',
        keywords: [
            'performance', 'cache', 'cdn', 'optimize', 'speed', 'latency', 'memory', 'throughput'
        ],
        riskLevel: 'Medium',
        impactedArea: 'Performance & Caching Layer',
        testingActivities: [
            'Conduct load and latency stress testing on impacted code paths.',
            'Verify cache invalidation key strategies and TTL behavior.'
        ]
    },
    {
        id: 'ui_frontend',
        keywords: [
            'ui', 'css', 'style', 'layout', 'theme', 'color', 'button', 'component', 
            'font', 'frontend', 'react', 'view', 'form', 'modal', 'page', 'design', 'responsive'
        ],
        riskLevel: 'Low',
        impactedArea: 'User Interface & Frontend Experience',
        testingActivities: [
            'Perform visual regression testing across target browsers.',
            'Verify responsive screen dimension rendering across mobile and desktop viewports.',
            'Test accessibility (a11y) standards including keyboard navigation.'
        ]
    }
];

const DEFAULT_TESTING = [
    'Perform standard unit and integration tests for modified code paths.',
    'Conduct manual smoke tests in the staging environment.'
];

export function analyzeChangeRisk(request: AnalyzeRiskRequest): AnalyzeRiskResponse {
    const normalizedInput = request.description.toLowerCase().trim();

    if (!normalizedInput) {
        return {
            riskLevel: 'Low',
            impactedAreas: ['Unspecified'],
            recommendedTesting: DEFAULT_TESTING
        };
    }

    const triggeredRules: Rule[] = [];

    // Evaluate rules using regex match to handle word boundaries cleanly
    for (const rule of RULES) {
        const matches = rule.keywords.some((kw) => {
            // Escapes potential special regex chars in keywords
            const escaped = kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
            return pattern.test(normalizedInput);
        });

        if (matches) {
            triggeredRules.push(rule);
        }
    }

    if (triggeredRules.length === 0) {
        return {
            riskLevel: 'Low',
            impactedAreas: ['General Core Logic'],
            recommendedTesting: DEFAULT_TESTING
        };
    }

    // Determine highest risk level: High > Medium > Low
    let overallRisk: RiskLevel = 'Low';
    if (triggeredRules.some((r) => r.riskLevel === 'High')) {
        overallRisk = 'High';
    } else if (triggeredRules.some((r) => r.riskLevel === 'Medium')) {
        overallRisk = 'Medium';
    }

    const impactedAreas = Array.from(new Set(triggeredRules.map((r) => r.impactedArea)));
    const recommendedTesting = Array.from(
        new Set(triggeredRules.flatMap((r) => r.testingActivities))
    );

    return {
        riskLevel: overallRisk,
        impactedAreas,
        recommendedTesting
    };
}