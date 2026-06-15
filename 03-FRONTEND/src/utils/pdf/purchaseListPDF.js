import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney } from '../formatMoney';
import { PRIMARY_COLOR, SECONDARY_COLOR, TEXT_COLOR, LIGHT_BG } from './pdfConfig';

export const generatePurchaseListPDF = (orders) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text('REPORTE DE ÓRDENES DE COMPRA', 14, 22);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Generado: ${new Date().toLocaleString('es-NI')}`, 14, 27);

  const totalAmount = orders.reduce((acc, o) => acc + Number(o.subtotal || o.total || 0), 0);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, 32, 182, 16, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RESUMEN', 18, 37);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Total de Órdenes: ${orders.length}`, 18, 43);
  doc.text(`Monto Total Acumulado: ${formatMoney(totalAmount)}`, 110, 43);

  const columns = [
    { title: 'Fecha', dataKey: 'date' },
    { title: 'N° Orden', dataKey: 'number' },
    { title: 'Proveedor', dataKey: 'supplier' },
    { title: 'Estado', dataKey: 'status' },
    { title: 'Total', dataKey: 'total' }
  ];

  const rows = orders.map((o) => ({
    date: new Date(o.createdAt).toLocaleDateString('es-NI'),
    number: o.orderNumber,
    supplier: o.supplierName || 'N/A',
    status: o.status,
    total: formatMoney(o.subtotal || o.total || 0)
  }));

  autoTable(doc, {
    columns,
    body: rows,
    startY: 55,
    theme: 'striped',
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
    margin: { left: 14, right: 14 }
  });

  doc.save(`Compras_${new Date().toISOString().split('T')[0]}.pdf`);
};
