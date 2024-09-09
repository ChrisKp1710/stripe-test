"use client";

import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Total',
          amount: 6500, // $65.00 come esempio
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });

      pr.on('paymentmethod', async (ev) => {
        const { error } = await stripe.confirmCardPayment(clientSecret!, {
          payment_method: ev.paymentMethod.id,
        });

        if (error) {
          ev.complete('fail');
          setIsProcessing(false);
        } else {
          ev.complete('success');
          setIsProcessing(false);
        }
      });
    }
  }, [stripe, clientSecret]);

  const createPayment = async (amount: number) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    setClientSecret(data.clientSecret);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    await createPayment(6500); // $65.00 come esempio

    if (!clientSecret) {
      console.error('clientSecret is null');
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
      },
    });

    if (error) {
      console.log('[Errore di pagamento]', error);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    alert('Payment successful!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Apple Pay / Google Pay */}
      {paymentRequest && (
        <div className="mb-6">
          <PaymentRequestButtonElement options={{ paymentRequest }} />
        </div>
      )}

      {/* Email input */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Email</label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="you@example.com"
        />
      </div>

      {/* Elemento per la carta di credito */}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Payment method</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '18px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true,
          }}
          className="p-3 border border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full bg-green-600 text-white font-bold py-3 rounded-md ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Pay'}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Powered by Stripe | Legal | Returns
      </p>
    </form>
  );
}
