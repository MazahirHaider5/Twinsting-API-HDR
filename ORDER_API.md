# Order API Documentation

This document outlines the Order API endpoints and the Stripe and PayPal payment integrations.

## Environment Variables

The following environment variables are required for payment processing:

```
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## Order Management Endpoints

### Create a new order

```
POST /api/order/create
```

**Request Body:**
```json
{
  "serviceId": "service_id",
  "pricingType": "starter|standard|advance",
  "deliveryDate": "2023-12-31T12:00:00Z",
  "location": "New York, USA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_number": "00001",
    "service_id": "service_id",
    "order_title": "Service Title - Package Name",
    "location": "New York, USA",
    "delivery_date": "2023-12-31T12:00:00Z",
    "status": "active",
    "amount": 100,
    "is_paid": false,
    "remaining_time": "15d 2h",
    "_id": "order_id",
    "createdAt": "2023-10-15T10:30:00Z",
    "updatedAt": "2023-10-15T10:30:00Z"
  }
}
```

### Get order details

```
GET /api/order/details/:orderId
```

**Response:**
```json
{
  "success": true,
  "message": "Order details retrieved successfully",
  "data": {
    "_id": "order_id",
    "order_number": "00001",
    "service_id": {
      "_id": "service_id",
      "title": "Service Title",
      "category": "Category",
      "subcategory": "Subcategory",
      "description": "Description"
    },
    "order_title": "Service Title - Package Name",
    "location": "New York, USA",
    "delivery_date": "2023-12-31T12:00:00Z",
    "status": "active",
    "amount": 100,
    "is_paid": false,
    "remaining_time": "15d 2h",
    "createdAt": "2023-10-15T10:30:00Z",
    "updatedAt": "2023-10-15T10:30:00Z"
  }
}
```

### Get user orders

```
GET /api/order/user
```

**Response:**
```json
{
  "success": true,
  "message": "User orders retrieved successfully",
  "data": [
    {
      "_id": "order_id",
      "order_number": "00001",
      "service_id": {
        "_id": "service_id",
        "title": "Service Title",
        "category": "Category",
        "subcategory": "Subcategory",
        "description": "Description"
      },
      "order_title": "Service Title - Package Name",
      "location": "New York, USA",
      "delivery_date": "2023-12-31T12:00:00Z",
      "status": "active",
      "amount": 100,
      "is_paid": false,
      "remaining_time": "15d 2h",
      "createdAt": "2023-10-15T10:30:00Z",
      "updatedAt": "2023-10-15T10:30:00Z"
    }
  ]
}
```

### Update order status

```
PATCH /api/order/status/:orderId
```

**Request Body:**
```json
{
  "status": "active|inactive|on way|completed|cancelled"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "order_id",
    "status": "completed"
  }
}
```

### Get all orders (admin only)

```
GET /api/order/all
```

## Payment Endpoints

### Stripe Checkout

1. Create a Stripe payment intent:

```
POST /api/order/checkout/stripe/:orderId
```

**Response:**
```json
{
  "success": true,
  "message": "Stripe payment intent created",
  "data": {
    "clientSecret": "pi_123456789_secret_987654321",
    "amount": 100
  }
}
```

2. Stripe Webhook (for payment confirmation):

```
POST /api/order/webhook/stripe
```

This endpoint is called by Stripe when a payment is completed or fails.

### PayPal Checkout

1. Create a PayPal order:

```
POST /api/order/checkout/paypal/:orderId
```

**Response:**
```json
{
  "success": true,
  "message": "PayPal order created",
  "data": {
    "orderId": "paypal_order_id",
    "amount": 100
  }
}
```

2. Capture PayPal payment:

```
POST /api/order/capture/paypal/:orderId
```

**Request Body:**
```json
{
  "paypalOrderId": "paypal_order_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment completed successfully",
  "data": {
    "id": "paypal_order_id",
    "status": "COMPLETED",
    "purchase_units": [
      {
        "reference_id": "default",
        "amount": {
          "currency_code": "USD",
          "value": "100.00"
        }
      }
    ]
  }
}
```

## Client-Side Integration

### Stripe Integration

1. Install the Stripe.js library:
```
npm install @stripe/stripe-js
```

2. Load the Stripe.js:
```javascript
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('your_publishable_key');
```

3. Create a payment form and submit:
```javascript
const handlePayment = async () => {
  const stripe = await stripePromise;
  
  // Get the client secret from your server
  const response = await fetch(`/api/order/checkout/stripe/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  const { data } = await response.json();
  
  // Confirm the payment
  const result = await stripe.confirmCardPayment(data.clientSecret, {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: {
        name: 'Customer Name',
      },
    },
  });
  
  if (result.error) {
    // Handle error
    console.error(result.error.message);
  } else if (result.paymentIntent.status === 'succeeded') {
    // Payment succeeded
    console.log('Payment succeeded!');
  }
};
```

### PayPal Integration

1. Install the PayPal SDK:
```
npm install @paypal/react-paypal-js
```

2. Set up PayPal Provider:
```javascript
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const initialOptions = {
  "client-id": "your_client_id",
  currency: "USD",
};

function App() {
  return (
    <PayPalScriptProvider options={initialOptions}>
      <YourComponent />
    </PayPalScriptProvider>
  );
}
```

3. Create PayPal Buttons component:
```javascript
import { PayPalButtons } from "@paypal/react-paypal-js";

function CheckoutComponent({ orderId, amount }) {
  return (
    <PayPalButtons
      createOrder={async () => {
        // Call your server to create the PayPal order
        const response = await fetch(`/api/order/checkout/paypal/${orderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const { data } = await response.json();
        return data.orderId;
      }}
      onApprove={async (data) => {
        // Call your server to capture the payment
        const response = await fetch(`/api/order/capture/paypal/${orderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypalOrderId: data.orderID }),
        });
        
        const responseData = await response.json();
        if (responseData.success) {
          console.log('Payment successful!');
        }
      }}
    />
  );
}
``` 