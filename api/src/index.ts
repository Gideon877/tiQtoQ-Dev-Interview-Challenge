import express, { Request, Response } from 'express';
import cors from 'cors';
import { analyzeChangeRisk } from './analyzer';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS so the Next.js UI (http://localhost:3000) can communicate with the API
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Healthcheck Endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Risk Assessment Analysis Endpoint
app.post('/api/analyze', (req: Request, res: Response) => {
    const { description } = req.body;

    if (typeof description !== 'string') {
        res.status(400).json({ error: 'Description must be a string.' });
        return;
    }

    const result = analyzeChangeRisk({ description });
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});