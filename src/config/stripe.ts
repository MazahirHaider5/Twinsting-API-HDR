import Stripe from 'stripe';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
  logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

export default stripe; 