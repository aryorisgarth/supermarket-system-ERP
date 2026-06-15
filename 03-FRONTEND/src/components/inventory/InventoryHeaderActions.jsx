import React from 'react';
import { Plus, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import ProductService from '../../services/ProductService';
import api from '../../services/api';
import Button from '../ui/Button';
import { normalizeProductList } from '../../utils/normalizeProduct';
import { generateInventoryReportPDF } from '../../utils/pdfGenerator';

const InventoryHeaderActions = ({ onOpenCreate, onOpenGuide }) => {
  const handleDownloadPDF = async () => {
    try {
      Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espere mientras cargamos el catálogo completo.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const res = await ProductService.getAll();
      const allProducts = normalizeProductList(res.content || []);
      Swal.close();
      generateInventoryReportPDF(allProducts);
    } catch (err) {
      Swal.close();
      Swal.fire('Error', 'No se pudo generar el reporte de inventario.', 'error');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      Swal.fire({
        title: 'Generando Excel...',
        text: 'Por favor espere mientras cargamos el reporte.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const response = await api.get('/reports/inventory-valued/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_valoracion_inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: '¡Descarga Completa!',
        text: 'El reporte de Excel se descargó correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.close();
      Swal.fire('Error', 'No se pudo generar ni descargar el archivo Excel. Verifica tus privilegios.', 'error');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onOpenGuide}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3.5 h-10 text-xs font-bold uppercase text-[var(--app-primary)] transition-colors cursor-pointer"
      >
        Guía de Flujo
      </button>
      <button
        type="button"
        onClick={handleDownloadPDF}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3.5 h-10 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
      >
        PDF Valorado
      </button>
      <button
        type="button"
        onClick={handleDownloadExcel}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3.5 h-10 text-xs font-bold uppercase text-slate-800 transition-colors cursor-pointer"
      >
        <Download size={14} /> Excel Valorado
      </button>
      <Button type="button" icon={Plus} onClick={onOpenCreate}>
        Nuevo producto
      </Button>
    </div>
  );
};

export default InventoryHeaderActions;
