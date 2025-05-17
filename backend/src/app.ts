import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { swaggerSpec } from './config/swagger';
import citizensRoutes from './modules/citizens/citizens.routes';
import morgan from 'morgan';
import agenciesRoutes from './modules/agencies/agencies.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import complaintsRoutes from './modules/complaints/complaints.routes';

const app = express();

// Logging middleware
app.use(morgan('dev'));

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Specific rate limit for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to password reset routes
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/citizens', citizensRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/complaints', complaintsRoutes);

// Error handling middleware
app.use(errorHandler);

export default app; 