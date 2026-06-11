/** Pasarelas soportadas por el backend (PaymentGatewayService.resolveGateway). */
export const PAYMENT_GATEWAY_OPTIONS = [
  {
    value: 'MOCK',
    label: 'Simulado (desarrollo)',
    scope: 'DEV',
    description: 'Aprueba todas las tarjetas. Ideal para pruebas académicas sin terminal físico.',
  },
  {
    value: 'VISANET',
    label: 'Visanet / BAC (Nacional)',
    scope: 'NACIONAL',
    description: 'Adquirente local Nicaragua (Visanet, BAC Credomatic). Simula autorización POS y liquidación T+N.',
  },
  {
    value: 'STRIPE',
    label: 'Stripe (Internacional)',
    scope: 'INTERNACIONAL',
    description: 'Pasarela global para tarjetas internacionales y comercio en línea.',
  },
];

export const getGatewayOption = (value) =>
  PAYMENT_GATEWAY_OPTIONS.find((opt) => opt.value === value) || PAYMENT_GATEWAY_OPTIONS[0];

export const getGatewayScopeLabel = (scope) => {
  if (scope === 'NACIONAL') return 'Nacional';
  if (scope === 'INTERNACIONAL') return 'Internacional';
  return 'Desarrollo';
};
