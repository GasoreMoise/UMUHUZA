import winston from 'winston';
import { Request } from 'express';

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Log password reset attempts
export const logPasswordResetAttempt = (
  req: Request,
  success: boolean,
  message: string,
  userId?: string
) => {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('user-agent'),
    success,
    message,
    userId,
    endpoint: req.originalUrl,
  };

  if (success) {
    logger.info('Password reset attempt', logData);
  } else {
    logger.warn('Failed password reset attempt', logData);
  }
};

// Log suspicious activity
export const logSuspiciousActivity = (
  req: Request,
  activity: string,
  details: any
) => {
  logger.error('Suspicious activity detected', {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('user-agent'),
    activity,
    details,
    endpoint: req.originalUrl,
  });
};

export default logger; 