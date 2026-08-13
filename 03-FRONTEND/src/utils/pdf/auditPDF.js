import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PRIMARY_COLOR, SECONDARY_COLOR, TEXT_COLOR } from './pdfConfig';
import { formatDateTime, getActionLabel, getModuleLabel, getActionCategoryLabel } from '../auditLogsHelper';

export const generateAuditReportPDF = (logs = [], filtersSummary = '') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 297, 8, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text('REPORTE DE AUDITORÍA OPERACIONAL', 14, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_COLOR);
  doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 24);
  if (filtersSummary) {
    doc.text(`Filtros: ${filtersSummary}`, 14, 29);
  }

  autoTable(doc, {
    startY: filtersSummary ? 34 : 30,
    head: [['Fecha', 'Usuario', 'Rol', 'Evento', 'Categoría', 'Módulo', 'Registro', 'IP']],
    body: logs.map((log) => [
      formatDateTime(log.logDate),
      log.userFullName || log.actor?.name || 'Sistema',
      log.actor?.role || '—',
      getActionLabel(log.action),
      getActionCategoryLabel(log.actionCategory),
      getModuleLabel(log.affectedTable),
      log.recordId ?? '—',
      log.ipAddress || '—',
    ]),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
};
