export const loadTicketSettings = (billingConfig) => {
  let company = 'SuperNova Market';
  let ownerName = '';
  let addr = '12 Calle 4-55 Zona 10, Ciudad de Guatemala';
  let ruc = billingConfig?.issuerTaxId || '1234567-8';
  let phone = '';
  let telefax = '';
  let enableMulti = false;
  let rate = 36.85;
  let showTicketLogo = true;
  let ticketHeaderMessage = 'Gracias por elegir SuperNova';
  let ticketFooterMessage = '*** GRACIAS POR SU COMPRA ***';
  let ticketAsfcCode = 'ASFC 19/0001/08/2020/5';
  let ticketSeries = 'A';
  let ticketPaymentLabel = 'PAGO CONTADO';
  let ticketExchangeNote = 'POR FAVOR PRESENTAR FACTURA PARA REALIZAR CAMBIOS';
  let ticketFontFamily = 'monospace';
  let ticketFontSize = 10;
  let ticketShowTaxId = true;
  let ticketLogo = localStorage.getItem('supernova_ticket_logo') || localStorage.getItem('supernova_logo');

  const saved = localStorage.getItem('supernova_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.companyName) company = parsed.companyName;
      if (parsed.ownerName) ownerName = parsed.ownerName;
      if (parsed.address) addr = parsed.address;
      if (parsed.taxId) ruc = parsed.taxId;
      if (parsed.phone) phone = parsed.phone;
      if (parsed.telefax) telefax = parsed.telefax;
      enableMulti = parsed.enableMultiCurrency ?? false;
      rate = parsed.exchangeRate ?? 36.85;
      showTicketLogo = parsed.showTicketLogo ?? true;
      ticketHeaderMessage = parsed.ticketHeaderMessage || '';
      ticketFooterMessage = parsed.ticketFooterMessage || '*** GRACIAS POR SU COMPRA ***';
      ticketAsfcCode = parsed.ticketAsfcCode || ticketAsfcCode;
      ticketSeries = parsed.ticketSeries || ticketSeries;
      ticketPaymentLabel = parsed.ticketPaymentLabel || ticketPaymentLabel;
      ticketExchangeNote = parsed.ticketExchangeNote || ticketExchangeNote;
      ticketFontFamily = parsed.ticketFontFamily || 'monospace';
      ticketFontSize = parsed.ticketFontSize || 10;
      ticketShowTaxId = parsed.ticketShowTaxId ?? true;
    } catch (e) {
      // ignore malformed settings
    }
  }

  return {
    company,
    ownerName,
    addr,
    ruc,
    phone,
    telefax,
    enableMulti,
    rate,
    showTicketLogo,
    ticketHeaderMessage,
    ticketFooterMessage,
    ticketAsfcCode,
    ticketSeries,
    ticketPaymentLabel,
    ticketExchangeNote,
    ticketFontFamily,
    ticketFontSize,
    ticketShowTaxId,
    ticketLogo,
  };
};
