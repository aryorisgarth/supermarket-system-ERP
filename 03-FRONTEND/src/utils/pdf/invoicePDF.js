import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney } from '../formatMoney';
import { PRIMARY_COLOR, SECONDARY_COLOR, TEXT_COLOR, LIGHT_BG } from './pdfConfig';

export const generateInvoicePDF = (receiptData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('SUPERNOVA ERP', 14, 25);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text('Supermercado y Distribuidora S.A.', 14, 30);
  doc.text('RUC: J0310000012345', 14, 34);
  doc.text('Dirección: Managua, Nicaragua', 14, 38);
  doc.text('Teléfono: +505 2277-1234 | soporte@supernova.com', 14, 42);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(...LIGHT_BG);
  doc.rect(130, 18, 66, 26, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text('FACTURA COMERCIAL', 135, 24);

  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.text(`N°: ${receiptData.invoiceNumber || 'PROV-0000'}`, 135, 30);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Fecha: ${new Date(receiptData.date).toLocaleString('es-NI')}`, 135, 36);
  doc.text(`Método: ${receiptData.paymentMethod || 'EFECTIVO'}`, 135, 40);

  doc.setLineWidth(0.2);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 50, 196, 50);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text('CLIENTE', 14, 56);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Nombre: ${receiptData.customerName || 'Consumidor Final'}`, 14, 62);
  doc.text(`Identificación: ${receiptData.customerTaxId || 'N/A'}`, 14, 67);

  const columns = [
    { title: 'Código', dataKey: 'code' },
    { title: 'Descripción', dataKey: 'desc' },
    { title: 'Cant.', dataKey: 'qty' },
    { title: 'Precio U.', dataKey: 'price' },
    { title: 'Desc.', dataKey: 'discount' },
    { title: 'Total', dataKey: 'total' }
  ];

  const rows = receiptData.items.map((item) => {
    const qty = item.quantity || 1;
    const price = item.salePrice || 0;
    const discount = item.discountAmount || 0;
    const lineTotal = (qty * price) - discount;

    return {
      code: item.barcode || 'N/A',
      desc: item.name || 'Producto sin nombre',
      qty: qty.toFixed(2),
      price: formatMoney(price),
      discount: discount > 0 ? formatMoney(discount) : '-',
      total: formatMoney(lineTotal)
    };
  });

  autoTable(doc, {
    columns,
    body: rows,
    startY: 75,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: TEXT_COLOR
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      code: { cellWidth: 35 },
      desc: { cellWidth: 65 },
      qty: { halign: 'right', cellWidth: 15 },
      price: { halign: 'right', cellWidth: 22 },
      discount: { halign: 'right', cellWidth: 22 },
      total: { halign: 'right', cellWidth: 22 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = doc.previousAutoTable.finalY + 8;

  if (finalY > 230) {
    doc.addPage();
    renderSummary(doc, 20, receiptData);
  } else {
    renderSummary(doc, finalY, receiptData);
  }

  doc.save(`Factura_${receiptData.invoiceNumber || '0000'}.pdf`);
};

const renderSummary = (doc, y, data) => {
  const leftX = 14;
  const rightX = 130;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text('Términos y Condiciones:', leftX, y);
  doc.text('1. No se aceptan devoluciones después de 48 horas.', leftX, y + 4);
  doc.text('2. Presentar factura original para cualquier reclamo.', leftX, y + 8);
  doc.text('3. Esta factura constituye un título valor conforme a la legislación local.', leftX, y + 12);

  doc.setFillColor(...LIGHT_BG);
  doc.rect(rightX, y - 2, 66, 32, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(rightX, y - 2, rightX + 66, y - 2);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', rightX + 5, y + 4);
  doc.text(formatMoney(data.subtotal - data.discountTotal), rightX + 61, y + 4, { align: 'right' });

  if (data.discountTotal > 0) {
    doc.text('Descuentos:', rightX + 5, y + 10);
    doc.text(`-${formatMoney(data.discountTotal)}`, rightX + 61, y + 10, { align: 'right' });
  }

  doc.text('IVA (15%):', rightX + 5, y + 16);
  doc.text(formatMoney(data.tax), rightX + 61, y + 16, { align: 'right' });

  doc.setFont('Helvetica', 'bold');
  doc.text('Total Neto:', rightX + 5, y + 24);
  doc.text(formatMoney(data.total), rightX + 61, y + 24, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('¡Gracias por su compra!', 105, y + 40, { align: 'center' });
};
