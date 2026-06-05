import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SIMU Backend Running' });
});

// ==================== AI ENDPOINTS ====================
app.get('/api/ai/health', (req, res) => {
    res.json({ 
        success: true, 
        ai_api_status: 'online',
        ai_response: { status: 'success', message: 'API and model are ready.' }
    });
});

app.post('/api/ai/predict', (req, res) => {
    const { userId, monthlyIncome } = req.body;
    
    console.log('Received request:', { userId, monthlyIncome });
    
    res.json({
        success: true,
        message: 'AI prediction endpoint is working!',
        received: { userId, monthlyIncome },
        prediction: {
            label: 'Moderate',
            confidence: 0.85
        },
        recommendation: 'Keuangan Anda cukup stabil. Pertahankan kebiasaan baik!'
    });
});

// ==================== EXPORT ====================
export const handler = serverless(app);

// ==================== LOCAL DEVELOPMENT ====================
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log(`   - GET  /api/health`);
        console.log(`   - GET  /api/ai/health`);
        console.log(`   - POST /api/ai/predict`);
    });
}