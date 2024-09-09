"use client";

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './components/PaymentForm';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  throw new Error("Missing Stripe publishable key");
}

const stripePromise = loadStripe(stripePublicKey);

export default function Home() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Lato sinistro - Dettagli dell'ordine */}
      <div className="bg-[#1A876B] p-8 text-white flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-4">Pure set</h3>
          <p className="text-3xl font-semibold mb-2">$65.00</p>
          <p className="text-sm text-gray-100 mb-6">Includes three essential skincare products</p>

          <div className="mt-8">
            <p className="text-lg font-semibold">Subtotal: $65.00</p>
            <p className="text-sm">Shipping: Free</p>
            <p className="text-lg font-bold mt-4">Total: $65.00</p>
          </div>
        </div>

        <button className="mt-6 bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
          Add to your order
        </button>
      </div>

      {/* Lato destro - Modulo di pagamento */}
      <div className="bg-white p-8">
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
}
