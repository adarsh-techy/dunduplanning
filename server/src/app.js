import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import stepRoutes from './routes/stepRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import featureRoutes from './routes/featureRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import appFeatureRoutes from './routes/appFeatureRoutes.js';
import deploymentRoutes from './routes/deploymentRoutes.js';
import packingRoutes from './routes/packingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { UPLOAD_DIR } from './middleware/upload.js';

const app = express();

app.use(
  cors({
    // Reflects back whichever configured origin the request came from
    // (env.clientOrigins, see config/env.js) instead of a single fixed
    // value -- lets one deploy allow both your production frontend and a
    // local/staging one. Requests with no Origin header (health checks,
    // curl, server-to-server) are always allowed through.
    origin: (origin, callback) => {
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" is not in CLIENT_URL`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (!env.isProduction) {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/app-progress', appFeatureRoutes);
app.use('/api/deployment', deploymentRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
