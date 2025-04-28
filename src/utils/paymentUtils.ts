import stripe from '../config/stripe';
import axios from 'axios';
import { getPayPalAccessToken, PAYPAL_BASE_URL } from '../config/paypal';
import logger from '../config/logger';

// Create Stripe payment intent
export const createStripePaymentIntent = async (amount: number, currency: string = 'usd', metadata: any = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    
    return paymentIntent;
  } catch (error) {
    logger.error('Error creating Stripe payment intent:', error);
    throw new Error('Failed to create payment with Stripe');
  }
};

// Confirm Stripe payment
export const confirmStripePayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Error confirming Stripe payment:', error);
    throw new Error('Failed to confirm Stripe payment');
  }
};

// Create PayPal order
export const createPayPalOrder = async (amount: number, currency: string = 'USD', description: string) => {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios({
      method: 'post',
      url: `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description,
          },
        ],
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error creating PayPal order:', error);
    throw new Error('Failed to create PayPal order');
  }
};

// Capture PayPal payment
export const capturePayPalPayment = async (orderId: string) => {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await axios({
      method: 'post',
      url: `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error capturing PayPal payment:', error);
    throw new Error('Failed to capture PayPal payment');
  }
}; 