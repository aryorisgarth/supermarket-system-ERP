import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import ResponsiveModal from '../ui/ResponsiveModal';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const stripePromise = publishableKey.startsWith('pk_') ? loadStripe(publishableKey) : null;

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onCancel, total, formatMoney }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: 'Cliente Supermercado' },
      },
    });
    setIsProcessing(false);

    if (result.error) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el pago',
        text: result.error.message || 'Invalid request',
        footer:
          result.error.message?.toLowerCase().includes('invalid')
            ? 'Revisa VITE_STRIPE_PUBLIC_KEY y que coincida con STRIPE_SECRET_KEY (mismo modo test/live).'
            : undefined,
      });
      return;
    }
    if (result.paymentIntent?.status === 'succeeded') {
      onPaymentSuccess(result.paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 md:p-5">
      <p className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-subtle)] px-3 py-2 text-xs text-[var(--app-text-soft)]">
        Tarjeta de prueba Stripe: <strong>4242 4242 4242 4242</strong> · cualquier fecha futura · CVC 123
      </p>
      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <label className="mb-2 block text-sm font-bold text-[var(--app-text)]">Detalles de la tarjeta</label>
        <div className="rounded-md border border-[var(--app-border)] bg-white p-3">
          <CardElement
            options={{
              style: {
                base: { fontSize: '16px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } },
                invalid: { color: '#b91c1c' },
              },
            }}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-[var(--app-border)] pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="rounded-lg bg-[var(--app-bg-subtle)] px-4 py-2 text-sm font-bold text-[var(--app-text-soft)] hover:opacity-90 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
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

  if (!stripePromise) {
    return (
      <ResponsiveModal
        isOpen
        onClose={onClose}
        icon={CreditCard}
        title="Pago con tarjeta"
        subtitle="Stripe no configurado"
        initialSize="md"
        sizeOptions={['sm', 'md', 'lg']}
        bodyClassName="p-5 text-sm text-[var(--app-text)]"
      >
        Falta <code>VITE_STRIPE_PUBLIC_KEY</code> válida (pk_test_...). Reconstruye el frontend con esa variable.
      </ResponsiveModal>
    );
  }

  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      icon={CreditCard}
      title="Pago con tarjeta (Stripe)"
      subtitle="Cobro seguro · modo prueba"
      initialSize="md"
      sizeOptions={['sm', 'md', 'lg']}
    >
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          clientSecret={clientSecret}
          onPaymentSuccess={onPaymentSuccess}
          onCancel={onClose}
          total={total}
          formatMoney={formatMoney}
        />
      </Elements>
    </ResponsiveModal>
  );
};

export default StripePaymentModal;
