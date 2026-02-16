import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import fipeRoutes from './routes/fipeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false, // Permite carregar imagens de outros domínios se necessário
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'REVVIO API v1.0 is running' });
});

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/fipe', fipeRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', async (req, res) => {
    try {
        const { data, error } = await supabase.from('vehicles').select('id').limit(1);
        if (error) throw error;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: (error as Error).message });
    }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
