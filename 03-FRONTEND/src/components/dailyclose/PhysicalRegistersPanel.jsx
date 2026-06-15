import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Plus, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import CashRegisterService from '../../services/CashRegisterService';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import PhysicalRegisterRow from './PhysicalRegisterRow';
import { showCreateDialog, showEditDialog, showDeleteConfirmation } from './PhysicalRegisterDialogs';

const PhysicalRegistersPanel = ({ onRefreshActiveSessions }) => {
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegisters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CashRegisterService.getAllPhysicalRegisters();
      setRegisters(data || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron obtener las terminales de caja.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegisters();
  }, [fetchRegisters]);

  const handleCreate = async () => {
    const formValues = await showCreateDialog();
    if (formValues) {
      try {
        await CashRegisterService.createPhysicalRegister(formValues);
        Swal.fire('Guardado', 'La terminal de caja ha sido creada.', 'success');
        fetchRegisters();
      } catch (error) {
        Swal.fire('Error', 'No se pudo crear la caja registradora.', 'error');
      }
    }
  };

  const handleEdit = async (register) => {
    const formValues = await showEditDialog(register);
    if (formValues) {
      try {
        await CashRegisterService.updatePhysicalRegister(register.id, formValues);
        Swal.fire('Actualizado', 'La terminal de caja ha sido actualizada.', 'success');
        fetchRegisters();
        if (onRefreshActiveSessions) onRefreshActiveSessions();
      } catch (error) {
        Swal.fire('Error', 'No se pudo actualizar la caja registradora.', 'error');
      }
    }
  };

  const handleDelete = async (register) => {
    const isConfirmed = await showDeleteConfirmation(register);
    if (isConfirmed) {
      try {
        await CashRegisterService.deletePhysicalRegister(register.id);
        Swal.fire('Inactivada', 'La terminal de caja ha sido inactivada.', 'success');
        fetchRegisters();
      } catch (error) {
        Swal.fire('Error', 'No se pudo inactivar la caja registradora.', 'error');
      }
    }
  };

  return (
    <Card className="shadow-enterprise-lg">
      <CardHeader
        icon={Monitor}
        title="Terminales de Caja Registradora"
        description="Gestión del equipamiento y visualización en tiempo real de terminales ocupadas."
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchRegisters} disabled={loading}>
              Refrescar
            </Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={handleCreate}>
              Crear Caja
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center text-[var(--app-text-muted)]">
          <span className="text-sm font-semibold">Cargando terminales físicas...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--app-border)] text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                <th className="py-3 px-4">Nombre / ID</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Estado Fiscal</th>
                <th className="py-3 px-4">Disponibilidad</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--app-border)] text-sm">
              {registers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[var(--app-text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-sm">No hay terminales físicas registradas en el sistema.</p>
                      <Button size="sm" variant="primary" icon={Plus} onClick={handleCreate}>
                        Crear Caja Registradora
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                registers.map((reg) => (
                  <PhysicalRegisterRow
                    key={reg.id}
                    reg={reg}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default PhysicalRegistersPanel;
