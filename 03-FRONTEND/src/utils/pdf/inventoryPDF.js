import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney } from '../formatMoney';
import { PRIMARY_COLOR, SECONDARY_COLOR, TEXT_COLOR, LIGHT_BG } from './pdfConfig';

export const generateInventoryReportPDF = (products) => {
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
  doc.text('REPORTE DE VALORACIÓN DE INVENTARIO', 14, 22);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Generado: ${new Date().toLocaleString('es-NI')}`, 14, 27);

  const totalCost = products.reduce((acc, p) => acc + (Number(p.purchasePrice || 0) * Number(p.currentStock || 0)), 0);
  const totalValue = products.reduce((acc, p) => acc + (Number(p.salePrice || 0) * Number(p.currentStock || 0)), 0);
  const totalItems = products.reduce((acc, p) => acc + Number(p.currentStock || 0), 0);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(...LIGHT_BG);
  doc.rect(14, 32, 182, 22, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MÉTRICAS DEL CATÁLOGO', 18, 37);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Productos Únicos: ${products.length}`, 18, 43);
  doc.text(`Artículos Totales: ${totalItems.toFixed(1)}`, 18, 48);

  doc.text(`Costo Total Estimado: ${formatMoney(totalCost)}`, 110, 43);
  doc.text(`Valor Venta Estimado: ${formatMoney(totalValue)}`, 110, 48);

  const columns = [
    { title: 'Cód. Barras', dataKey: 'barcode' },
    { title: 'Producto', dataKey: 'name' },
    { title: 'Stock', dataKey: 'stock' },
    { title: 'Costo U.', dataKey: 'cost' },
    { title: 'Precio V.', dataKey: 'price' },
    { title: 'Val. Total', dataKey: 'total' }
  ];

  const rows = products.map((p) => {
    const stock = Number(p.currentStock || 0);
    const price = Number(p.salePrice || 0);
    const cost = Number(p.purchasePrice || 0);
    const total = stock * price;

    return {
      barcode: p.barcode || 'N/A',
      name: p.name || 'Sin nombre',
      stock: stock.toFixed(1),
      cost: formatMoney(cost),
      price: formatMoney(price),
      total: formatMoney(total)
    };
  });

  autoTable(doc, {
    columns,
    body: rows,
    startY: 60,
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
    columnStyles: {
      barcode: { cellWidth: 32 },
      name: { cellWidth: 70 },
      stock: { halign: 'right', cellWidth: 16 },
      cost: { halign: 'right', cellWidth: 21 },
      price: { halign: 'right', cellWidth: 21 },
      total: { halign: 'right', cellWidth: 22 }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`Inventario_Valorado_${new Date().toISOString().split('T')[0]}.pdf`);
};
