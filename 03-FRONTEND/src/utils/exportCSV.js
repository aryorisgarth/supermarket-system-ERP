export const exportPurchasesToCSV = (orders) => {
  const headers = ['Fecha', 'Orden', 'Proveedor', 'Estado', 'Subtotal', 'Notas'];
  const rows = orders.map((o) => [
    new Date(o.createdAt).toLocaleString('es-NI'),
    o.orderNumber,
    `"${(o.supplierName || '').replace(/"/g, '""')}"`,
    o.status,
    o.subtotal || 0,
    `"${(o.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Compras_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
