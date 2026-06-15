import Swal from 'sweetalert2';

export const showCreateDialog = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Nueva Terminal de Caja',
    html: `
      <div style="margin-bottom: 1rem; text-align: left;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Nombre de la caja</label>
        <input id="swal-input-name" placeholder="Ej. Caja 03 - Pasillo Central" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" />
      </div>
      <div style="text-align: left;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Descripción</label>
        <input id="swal-input-desc" placeholder="Ej. Terminal táctil con impresora fiscal" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4f46e5',
    preConfirm: () => {
      const name = document.getElementById('swal-input-name').value;
      const description = document.getElementById('swal-input-desc').value;
      if (!name.trim()) {
        Swal.showValidationMessage('El nombre de la caja es obligatorio');
        return false;
      }
      return { name, description };
    }
  });
  return formValues;
};

export const showEditDialog = async (register) => {
  const { value: formValues } = await Swal.fire({
    title: 'Editar Terminal de Caja',
    html: `
      <div style="margin-bottom: 1rem; text-align: left;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Nombre de la caja</label>
        <input id="swal-input-name" value="${register.name}" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" />
      </div>
      <div style="margin-bottom: 1rem; text-align: left;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Descripción</label>
        <input id="swal-input-desc" value="${register.description || ''}" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" />
      </div>
      <div style="text-align: left;">
        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Estado</label>
        <select id="swal-input-status" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;">
          <option value="ACTIVE" ${register.status === 'ACTIVE' ? 'selected' : ''}>Activa</option>
          <option value="INACTIVE" ${register.status === 'INACTIVE' ? 'selected' : ''}>Inactiva</option>
        </select>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4f46e5',
    preConfirm: () => {
      const name = document.getElementById('swal-input-name').value;
      const description = document.getElementById('swal-input-desc').value;
      const status = document.getElementById('swal-input-status').value;
      if (!name.trim()) {
        Swal.showValidationMessage('El nombre de la caja es obligatorio');
        return false;
      }
      return { name, description, status };
    }
  });
  return formValues;
};

export const showDeleteConfirmation = async (register) => {
  const res = await Swal.fire({
    title: '¿Inactivar terminal de caja?',
    text: `Se cambiará el estado de "${register.name}" a INACTIVE. Los cajeros no podrán seleccionarla para abrir turnos.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, inactivar',
    cancelButtonText: 'Volver',
    confirmButtonColor: '#dc2626',
  });
  return res.isConfirmed;
};
