import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to preserve raw body for Stripe webhooks
 * This is necessary because Stripe requires the raw request body for webhook signature verification
 */
export const rawBodyParser = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/order/webhook/stripe' && req.headers['stripe-signature']) {
    let data = '';
    
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
      data += chunk;
    });
    
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  } else {
    next();
  }
}; 