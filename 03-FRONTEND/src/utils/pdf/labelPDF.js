import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { formatMoney } from '../formatMoney';
import { loadSettings } from '../settingsStorage';
import { expandProductLabelItems, expandShelfLabelItems, formatLocationLine, formatUomLabel } from '../labelPrint';
import { PRIMARY_COLOR, TEXT_COLOR } from './pdfConfig';

const PAGE = { width: 210, height: 297, margin: 8 };

const SHELF_GRID = { cols: 2, rows: 4 };
const SHELF_CELL = {
  width: (PAGE.width - PAGE.margin * 2) / SHELF_GRID.cols,
  height: (PAGE.height - PAGE.margin * 2 - 12) / SHELF_GRID.rows,
};

const PRODUCT_GRID = { cols: 4, rows: 8 };
const PRODUCT_CELL = {
  width: (PAGE.width - PAGE.margin * 2) / PRODUCT_GRID.cols,
  height: (PAGE.height - PAGE.margin * 2 - 10) / PRODUCT_GRID.rows,
};

function createBarcodeDataUrl(value) {
  if (!value) return null;
  const canvas = document.createElement('canvas');
  const code = String(value).trim();
  try {
    const format = /^\d{13}$/.test(code) ? 'EAN13' : 'CODE128';
    JsBarcode(canvas, code, {
      format,
      displayValue: true,
      fontSize: 10,
      height: 32,
      margin: 0,
      width: 1.4,
    });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

function truncateText(doc, text, maxWidth) {
  let value = String(text || '');
  while (value.length > 0 && doc.getTextWidth(value) > maxWidth) {
    value = value.slice(0, -1);
  }
  if (value.length < String(text || '').length) {
    return `${value.slice(0, Math.max(0, value.length - 1))}…`;
  }
  return value;
}

function drawShelfStrip(doc, item, x, y, width, height, companyName) {
  const padding = 3;
  const innerWidth = width - padding * 2;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(truncateText(doc, companyName, innerWidth), x + padding, y + 5);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(formatMoney(item.salePrice), x + padding, y + 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`POR ${formatUomLabel(item.uomBase)}`, x + padding, y + 23);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const nameLines = doc.splitTextToSize(item.name || 'Producto', innerWidth);
  doc.text(nameLines.slice(0, 2), x + padding, y + 30);

  const barcodeUrl = createBarcodeDataUrl(item.barcode);
  if (barcodeUrl) {
    doc.addImage(barcodeUrl, 'PNG', x + padding, y + 38, innerWidth, 12);
  } else {
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.text(item.barcode || 'S/C', x + padding, y + 46);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 64, 175);
  doc.text(truncateText(doc, formatLocationLine(item.location), innerWidth), x + padding, y + height - 14);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const meta = [item.categoryName, item.brandName].filter(Boolean).join(' · ').toUpperCase();
  doc.text(truncateText(doc, meta || 'GENERAL', innerWidth), x + padding, y + height - 8);

  if (item.minStockExhibicion != null) {
    doc.text(`Cap. exhibición: ${Number(item.minStockExhibicion).toLocaleString('en-US')}`, x + padding, y + height - 4);
  }
}

function drawProductLabel(doc, item, x, y, width, height) {
  const padding = 2;
  const innerWidth = width - padding * 2;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(x, y, width, height);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  const nameLines = doc.splitTextToSize(item.name || 'Producto', innerWidth);
  doc.text(nameLines.slice(0, 2), x + padding, y + 4);

  const barcodeUrl = createBarcodeDataUrl(item.barcode);
  if (barcodeUrl) {
    doc.addImage(barcodeUrl, 'PNG', x + padding, y + 9, innerWidth, 8);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(formatMoney(item.salePrice), x + padding, y + height - 3);
}

function drawGridPages(doc, items, grid, cell, drawItem, headerTitle) {
  const settings = loadSettings();
  const companyName = settings.companyName || 'SuperNova Market';
  let index = 0;

  while (index < items.length) {
    if (index > 0) doc.addPage();

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_COLOR);
    doc.text(headerTitle, PAGE.margin, PAGE.margin + 2);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(new Date().toLocaleString('es-NI'), PAGE.width - PAGE.margin, PAGE.margin + 2, { align: 'right' });

    const startY = PAGE.margin + 6;

    for (let row = 0; row < grid.rows && index < items.length; row += 1) {
      for (let col = 0; col < grid.cols && index < items.length; col += 1) {
        const x = PAGE.margin + col * cell.width;
        const y = startY + row * cell.height;
        drawItem(doc, items[index], x, y, cell.width - 2, cell.height - 2, companyName);
        index += 1;
      }
    }
  }
}

export function generateShelfStripPDF(products = []) {
  const items = expandShelfLabelItems(products);
  if (items.length === 0) {
    throw new Error('No hay productos para generar flejes.');
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawGridPages(
    doc,
    items,
    SHELF_GRID,
    SHELF_CELL,
    (pdf, item, x, y, w, h, companyName) => drawShelfStrip(pdf, item, x, y, w, h, companyName),
    'FLEJES DE GÓNDOLA'
  );

  doc.save(`flejes_gondola_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateProductLabelPDF(products = [], copies = 1) {
  const items = expandProductLabelItems(products, copies);
  if (items.length === 0) {
    throw new Error('No hay productos para generar etiquetas.');
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawGridPages(
    doc,
    items,
    PRODUCT_GRID,
    PRODUCT_CELL,
    (pdf, item, x, y, w, h) => drawProductLabel(pdf, item, x, y, w, h),
    'ETIQUETAS DE PRODUCTO'
  );

  doc.save(`etiquetas_producto_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function printShelfStripPDF(products = []) {
  generateShelfStripPDF(products);
}

export function printProductLabelPDF(products = [], copies = 1) {
  generateProductLabelPDF(products, copies);
}
