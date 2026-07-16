import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Cargar Stripe fuera del componente para evitar recrearlo en cada render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onCancel, total, formatMoney }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'Cliente Supermercado',
        },
      }
    });

    setIsProcessing(false);

    if (result.error) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el pago',
        text: result.error.message,
      });
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Detalles de la Tarjeta
        </label>
        <div className="p-3 bg-white border border-slate-300 rounded-md">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
          Pagar {formatMoney(total)}
        </button>
      </div>
    </form>
  );
};

const StripePaymentModal = ({ show, onClose, clientSecret, onPaymentSuccess, total, formatMoney }) => {
  if (!show || !clientSecret) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <CreditCard size={18} />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Pago con Tarjeta (Stripe)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              clientSecret={clientSecret} 
              onPaymentSuccess={onPaymentSuccess} 
              onCancel={onClose}
              total={total}
              formatMoney={formatMoney}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;
