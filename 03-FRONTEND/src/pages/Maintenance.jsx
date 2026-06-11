import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import MaintenanceService from '../services/MaintenanceService';
import Swal from 'sweetalert2';

const Maintenance = () => {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [backupPolicy, setBackupPolicy] = useState({
    frequency: 'DAILY',
    time: '02:00',
    dest: 'AMAZON_S3'
  });

  useEffect(() => {
    const saved = localStorage.getItem('supernova_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBackupPolicy({
          frequency: parsed.backupFrequency || 'DAILY',
          time: parsed.backupTime || '02:00',
          dest: parsed.backupDest || 'AMAZON_S3'
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      Swal.fire({
        title: 'Generando respaldo...',
        html: 'Creando script de estructura y datos de la base de datos MySQL.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const data = await MaintenanceService.downloadBackup();
      
      const fileName = `supermarket_backup_${new Date().toISOString().split('T')[0]}.sql`;
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: '¡Respaldo Generado!',
        text: 'El archivo SQL ha sido descargado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo generar el respaldo. Revisa tus privilegios en el backend.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire('Archivo requerido', 'Por favor selecciona un archivo SQL de respaldo válido.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: '¿Confirmar restauración?',
      text: '¡PRECAUCIÓN! Esta acción sobrescribirá todos los datos actuales del supermercado (usuarios, productos, ventas) con los datos del archivo cargado. Esta operación es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, restaurar base de datos',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setRestoring(true);
      try {
        Swal.fire({
          title: 'Restaurando base de datos...',
          html: 'Procesando el script SQL en el motor de base de datos MySQL.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await MaintenanceService.restoreBackup(selectedFile);
        
        Swal.fire({
          icon: 'success',
          title: '¡Base de datos restaurada!',
          text: 'El sistema ha sido restaurado con éxito.',
          confirmButtonColor: '#4f46e5'
        });
        
        setSelectedFile(null);
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo al restaurar la base de datos. Asegúrate de que el archivo tenga un formato SQL de base de datos compatible.', 'error');
      } finally {
        setRestoring(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-[var(--app-text)] tracking-tight flex items-center gap-2">
          <Database className="text-[var(--app-primary)] animate-pulse" size={28} strokeWidth={2.5} />
          Mantenimiento del Sistema
        </h2>
        <p className="text-[var(--app-text-muted)] text-sm font-medium">Respaldo y restauración integral de la base de datos MySQL. Acceso exclusivo para el Ingeniero de Sistemas.</p>
      </div>

      {/* Banner de Política Activa de Respaldos */}
      <div className="bg-[var(--app-primary-soft)] border border-[var(--app-primary)]/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--app-surface)] text-[var(--app-primary)] rounded-2xl shrink-0 border border-[var(--app-border)] shadow-sm">
            <Database size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="font-black text-[var(--app-text)] text-sm">Política de Respaldos Activa (Nube)</h4>
            <p className="text-[10px] text-[var(--app-text-soft)] font-bold uppercase tracking-widest mt-1 opacity-80">
              Frecuencia: <span className="text-[var(--app-primary)] font-black">{backupPolicy.frequency}</span> | 
              Hora: <span className="text-[var(--app-primary)] font-black">{backupPolicy.time}</span> | 
              Destino: <span className="text-[var(--app-primary)] font-black">{backupPolicy.dest?.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
        <span className="bg-[var(--app-success-soft)] text-emerald-500 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse w-fit">
          Automatizado
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Respaldo */}
        <div className="bg-[var(--app-surface)] p-8 rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-xl transition-all duration-300 space-y-6">
          <div className="p-3 bg-[var(--app-primary-soft)] rounded-2xl w-fit text-[var(--app-primary)] border border-[var(--app-primary)]/10">
            <Download size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[var(--app-text)]">Generar Respaldo Local</h3>
            <p className="text-[var(--app-text-soft)] text-sm mt-3 leading-relaxed font-medium">
              Descarga una copia completa de seguridad que incluye la estructura de tablas y todos los datos registrados hasta el momento (ventas, stock de productos, cuentas de usuario, auditoría).
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-[var(--app-primary)] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} strokeWidth={2.5} />
            )}
            Descargar Respaldo (.SQL)
          </button>
        </div>

        {/* Card Restaurar */}
        <div className="bg-[var(--app-surface)] p-8 rounded-3xl border border-[var(--app-border)] shadow-sm hover:shadow-xl transition-all duration-300 space-y-6">
          <div className="p-3 bg-[var(--app-danger-soft)] rounded-2xl w-fit text-[var(--app-danger)] border border-[var(--app-danger)]/10">
            <ShieldAlert size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[var(--app-text)]">Restaurar Base de Datos</h3>
            <p className="text-[var(--app-text-soft)] text-sm mt-3 leading-relaxed font-medium">
              Sube un archivo de respaldo `.sql` previamente generado para restablecer el sistema a un punto de control anterior. 
            </p>
          </div>

          <div className="bg-[var(--app-danger-soft)] border border-[var(--app-danger)]/10 rounded-2xl p-4 flex gap-3 text-[var(--app-danger)]">
            <ShieldAlert className="shrink-0 mt-0.5" size={20} strokeWidth={2.5} />
            <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight">
              Atención: Este proceso eliminará y reemplazará toda la información existente. Operación irreversible.
            </p>
          </div>

          <form onSubmit={handleRestore} className="space-y-4">
            <div className="relative border-2 border-dashed border-[var(--app-border)] hover:border-[var(--app-primary)]/40 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[var(--app-bg-subtle)]/30 hover:bg-[var(--app-surface)] flex flex-col items-center justify-center gap-2 group">
              <input
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload size={36} className="text-[var(--app-text-muted)] group-hover:text-[var(--app-primary)] transition-colors" strokeWidth={2.5} />
              <span className="text-sm font-black text-[var(--app-text)]">
                {selectedFile ? selectedFile.name : 'Haz clic para cargar archivo .SQL'}
              </span>
              <span className="text-[10px] text-[var(--app-text-muted)] font-black uppercase tracking-widest">Tamaño máx: 50MB</span>
            </div>

            <button
              type="submit"
              disabled={restoring || !selectedFile}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all duration-300 cursor-pointer ${
                !selectedFile 
                  ? 'bg-[var(--app-bg-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)] cursor-not-allowed shadow-none' 
                  : 'bg-red-500 text-white shadow-red-500/20 hover:scale-105 active:scale-95'
              }`}
            >
              {restoring ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <RefreshCw size={20} strokeWidth={2.5} />
              )}
              Iniciar Restauración
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
