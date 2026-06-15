import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney } from '../formatMoney';
import { PRIMARY_COLOR, SECONDARY_COLOR, TEXT_COLOR, LIGHT_BG } from './pdfConfig';

export const generateCashRegisterClosurePDF = (summary) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const session = summary.session;

  doc.setFillColor(...SECONDARY_COLOR);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text('ACTA DE ARQUEO Y CIERRE DE CAJA', 14, 22);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Generado: ${new Date().toLocaleString('es-NI')}`, 14, 27);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, 32, 182, 32, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('INFORMACIÓN GENERAL DEL TURNO', 18, 38);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Cajero: ${session.cashier?.fullName || session.cashierName || 'N/A'}`, 18, 44);
  doc.text(`Caja Registradora: ${session.cashRegister?.name || session.cashRegisterName || 'N/A'}`, 18, 49);
  doc.text(`Estado del Turno: ${session.status === 'CLOSED' ? 'CERRADO / CUADRADO' : 'ABIERTO'}`, 18, 54);

  doc.text(`Apertura: ${new Date(session.openedAt).toLocaleString('es-NI')}`, 110, 44);
  doc.text(`Cierre: ${session.closedAt ? new Date(session.closedAt).toLocaleString('es-NI') : 'En curso'}`, 110, 49);
  doc.text(`Monto Inicial: ${formatMoney(session.openingBalance)}`, 110, 54);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RESUMEN FINANCIERO (SISTEMA)', 14, 73);

  const finColumns = [
    { title: 'Concepto', dataKey: 'concept' },
    { title: 'Monto Registrado', dataKey: 'amount' }
  ];

  const finRows = [
    { concept: 'Ventas en Efectivo (Bruto)', amount: formatMoney(summary.cashSales) },
    { concept: 'Cambio Entregado (Vuelto)', amount: `-${formatMoney(summary.changeAmount)}` },
    { concept: 'Ventas Netas en Efectivo', amount: formatMoney(summary.cashSales - summary.changeAmount) },
    { concept: 'Ventas con Tarjeta', amount: formatMoney(summary.cardSales) },
    { concept: 'Ventas con Transferencia', amount: formatMoney(summary.transferSales) },
    { concept: 'Devoluciones / Reembolsos', amount: `-${formatMoney(summary.refunds)}` },
    { concept: 'Ingresos Manuales de Caja (CASH IN)', amount: formatMoney(summary.manualCashIn) },
    { concept: 'Egresos Manuales de Caja (CASH OUT)', amount: `-${formatMoney(summary.manualCashOut)}` },
    { concept: 'Saldo Final Esperado en Efectivo', amount: formatMoney(summary.expectedCash) }
  ];

  autoTable(doc, {
    columns: finColumns,
    body: finRows,
    startY: 77,
    theme: 'grid',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_COLOR
    },
    columnStyles: {
      concept: { cellWidth: 120 },
      amount: { halign: 'right', cellWidth: 62 }
    },
    margin: { left: 14, right: 14 }
  });

  const nextY = doc.previousAutoTable.finalY + 8;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONCILIACIÓN Y DECLARACIÓN DE ARQUEO', 14, nextY);

  const arqColumns = [
    { title: 'Método de Pago', dataKey: 'method' },
    { title: 'Esperado Sistema', dataKey: 'expected' },
    { title: 'Contado Físico', dataKey: 'counted' },
    { title: 'Diferencia', dataKey: 'diff' }
  ];

  const cashDiff = session.difference || 0;
  const cardDiff = session.cardDifference || 0;
  const transDiff = session.transferDifference || 0;

  const arqRows = [
    {
      method: 'Efectivo',
      expected: formatMoney(summary.expectedCash),
      counted: formatMoney(session.actualClosingBalance || 0),
      diff: formatMoney(cashDiff)
    },
    {
      method: 'Tarjeta',
      expected: formatMoney(summary.expectedCard || 0),
      counted: formatMoney(session.countedCard || 0),
      diff: formatMoney(cardDiff)
    },
    {
      method: 'Transferencia',
      expected: formatMoney(summary.expectedTransfer || 0),
      counted: formatMoney(session.countedTransfer || 0),
      diff: formatMoney(transDiff)
    }
  ];

  autoTable(doc, {
    columns: arqColumns,
    body: arqRows,
    startY: nextY + 4,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_COLOR
    },
    columnStyles: {
      method: { cellWidth: 45 },
      expected: { halign: 'right', cellWidth: 45 },
      counted: { halign: 'right', cellWidth: 45 },
      diff: { halign: 'right', cellWidth: 47 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.previousAutoTable.finalY + 25;

  doc.setDrawColor(148, 163, 184);
  doc.line(25, finalY, 85, finalY);
  doc.line(125, finalY, 185, finalY);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Firma Cajero', 55, finalY + 4, { align: 'center' });
  doc.text(`ID: ${session.cashier?.id || ''}`, 55, finalY + 8, { align: 'center' });

  doc.text('Firma Supervisor/Auditor', 155, finalY + 4, { align: 'center' });
  doc.text('Supermercado Supernova', 155, finalY + 8, { align: 'center' });

  doc.save(`Arqueo_Caja_${session.id}.pdf`);
};
