import React from 'react';
import { formatMoney } from '../../utils/formatMoney';

const money = formatMoney;

const ThermalReceiptView = ({
  receiptData,
  taxRate,
  company,
  ownerName,
  addr,
  ruc,
  phone,
  telefax,
  enableMulti,
  rate,
  showTicketLogo,
  ticketLogo,
  ticketHeaderMessage,
  ticketFooterMessage,
  ticketAsfcCode,
  ticketSeries,
  ticketPaymentLabel,
  ticketExchangeNote,
  ticketFontFamily,
  ticketFontSize,
  ticketShowTaxId,
  printedDate,
  printedTime,
  articleCount,
  discountTotal,
}) => {
  const getLineDiscount = (item) => Number(item.discountAmount || item.discount || 0);
  const getLineGross = (item) => Number(item.salePrice || 0) * Number(item.quantity || 0);

  return (
    <div
      className="ticket-paper print-area mx-auto w-full max-w-[80mm] p-5 leading-relaxed shadow-md"
      style={{ fontFamily: ticketFontFamily, fontSize: `${ticketFontSize}px` }}
    >
      <div className="mb-3 space-y-0.5 text-center">
        {showTicketLogo && ticketLogo && (
          <img src={ticketLogo} alt="Logo ticket" className="mx-auto mb-2 max-h-14 max-w-[140px] object-contain" />
        )}
        <h2 className="text-[1.2em] font-bold uppercase text-slate-900">{company}</h2>
        {ticketHeaderMessage && <p className="text-[0.85em] font-semibold text-slate-600">{ticketHeaderMessage}</p>}
        {ownerName && <p className="text-[8px] font-semibold uppercase text-slate-600">{ownerName}</p>}
        {ticketShowTaxId && <p className="text-[8px] text-slate-500">RUC: {ruc}</p>}
        {ticketAsfcCode && <p className="text-[8px] text-slate-500">{ticketAsfcCode}</p>}
        <p className="text-[8px] text-slate-500">{addr}</p>
        {(phone || telefax) && (
          <p className="text-[8px] text-slate-500">
            {phone && `TEL: ${phone}`} {telefax && ` TELEFAX: ${telefax}`}
          </p>
        )}
      </div>

      <div className="my-2 border-b border-dashed border-slate-300" />

      <div className="space-y-1 text-[8.5px]">
        <div className="grid grid-cols-2 gap-x-2">
          <div><span>SERIE:</span> <b>{ticketSeries}</b></div>
          <div className="text-right"><span>FACTURA:</span> <b>{receiptData.invoiceNumber}</b></div>
          <div><span>{ticketPaymentLabel}</span></div>
          <div className="text-right"><span>T/C:</span> <b>{Number(rate || 0).toFixed(2)}</b></div>
          <div><span>FECHA:</span> <b>{printedDate}</b></div>
          <div className="text-right"><span>HORA:</span> <b>{printedTime}</b></div>
        </div>
        <div className="flex justify-between"><span>CLIENTE:</span><b className="max-w-[150px] truncate uppercase">{receiptData.customerName}</b></div>
        <div className="flex justify-between"><span>RUC/ID:</span><b>{receiptData.customerTaxId}</b></div>
      </div>

      <div className="my-2 border-b border-dashed border-slate-300" />

      <div className="grid grid-cols-12 text-[7.5px] font-bold uppercase text-slate-500">
        <span className="col-span-3">Codigo</span>
        <span className="col-span-1 text-center">U/M</span>
        <span className="col-span-2 text-right">Cant</span>
        <span className="col-span-2 text-right">P/U</span>
        <span className="col-span-2 text-right">Desc</span>
        <span className="col-span-2 text-right">Valor</span>
      </div>

      <div className="mt-1 space-y-1.5">
        {receiptData.items.map((item, index) => (
          <div key={`${item.id}-${index}`}>
            <div className="truncate uppercase text-[8px] font-bold text-slate-900">{item.name}</div>
            <div className="grid grid-cols-12 text-[8px]">
              <span className="col-span-3 truncate text-slate-900">{item.barcode || 'N/A'}</span>
              <span className="col-span-1 text-center text-slate-900">UND</span>
              <span className="col-span-2 text-right text-slate-900">{item.quantity}</span>
              <span className="col-span-2 text-right text-slate-900">{money(item.salePrice)}</span>
              <span className="col-span-2 text-right text-slate-900">{money(getLineDiscount(item))}</span>
              <span className="col-span-2 text-right text-slate-900">{money(Math.max(0, getLineGross(item) - getLineDiscount(item)))}</span>
            </div>
            {item.extraData && <p className="text-[8px] italic text-slate-600">Extra: {item.extraData}</p>}
          </div>
        ))}
      </div>

      <div className="my-2 border-b border-dashed border-slate-300" />

      <div className="space-y-1">
        <div className="flex justify-between"><span>CANTIDAD DE ARTICULOS:</span><span>{articleCount}</span></div>
        <div className="flex justify-between"><span>SUBTOTAL:</span><span>{money(receiptData.subtotal)}</span></div>
        <div className="flex justify-between"><span>DESCUENTO:</span><span>{money(discountTotal)}</span></div>
        <div className="flex justify-between"><span>IVA ({taxRate}%):</span><span>{money(receiptData.tax)}</span></div>
        <div className="flex justify-between pt-1 text-[12px] font-bold"><span>TOTAL:</span><span>{money(receiptData.total)}</span></div>
        {enableMulti && (
          <div className="flex justify-between text-[9px] font-bold text-emerald-600 border-t border-dotted border-slate-200 mt-1 pt-1">
            <span>TOTAL USD REF:</span>
            <span>USD ${(receiptData.total / rate).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="my-2 border-b border-dashed border-slate-300" />

      <div className="space-y-1">
        <div className="flex justify-between"><span>CANCELO CON:</span><b>{receiptData.paymentMethod}</b></div>
        {receiptData.amountReceived > 0 && (
          <div className="flex justify-between"><span>RECIBIDO:</span><b>{money(receiptData.amountReceived)}</b></div>
        )}
        {receiptData.change > 0 && (
          <div className="flex justify-between"><span>VUELTO:</span><b>{money(receiptData.change)}</b></div>
        )}
      </div>

      {receiptData.hasCustomer && (
        <>
          <div className="my-2 border-b border-dashed border-slate-350" />
          <div className="space-y-0.5 text-[8px] font-semibold text-slate-800">
            <div className="flex justify-between"><span>CLIENTE:</span><b>{receiptData.customerName}</b></div>
            <div className="flex justify-between"><span>PUNTOS GANADOS:</span><b className="text-emerald-700">+{receiptData.pointsEarned || 0} pts</b></div>
            {receiptData.pointsRedeemed > 0 && (
              <div className="flex justify-between"><span>PUNTOS CANJEADOS:</span><b className="text-rose-600">-{receiptData.pointsRedeemed} pts</b></div>
            )}
            <div className="flex justify-between border-t border-dotted border-slate-300 pt-0.5 mt-0.5">
              <span>SALDO TOTAL:</span>
              <b>{receiptData.customerPoints || 0} pts ≈ Q{(receiptData.customerPoints || 0).toFixed(0)} disp.</b>
            </div>
          </div>
        </>
      )}

      {receiptData.felAuthNumber && (
        <>
          <div className="my-2 border-b border-dashed border-slate-300" />
          <div className="space-y-1 text-center">
            <p className="text-[8px] font-bold uppercase">Documento Tributario Electronico</p>
            <p className="break-all text-[7.5px]">AUTORIZACION SAT: {receiptData.felAuthNumber}</p>
            <p className="text-[7.5px]">SERIE: DTE-1 / NUMERO: {receiptData.felInvoiceNumber}</p>
          </div>
        </>
      )}

      {ticketFooterMessage && (
        <div className="mt-4 text-center text-[0.85em] font-bold tracking-wider text-slate-500">
          {ticketFooterMessage}
        </div>
      )}
      {ticketExchangeNote && (
        <div className="mt-2 text-center text-[0.75em] font-bold uppercase text-slate-500">
          {ticketExchangeNote}
        </div>
      )}
      {enableMulti && (
        <p className="mt-2 text-center text-[0.75em] font-semibold text-slate-500">
          TASA DE CAMBIO: 1 USD = {rate} MONEDA LOCAL
        </p>
      )}
    </div>
  );
};

export default ThermalReceiptView;
