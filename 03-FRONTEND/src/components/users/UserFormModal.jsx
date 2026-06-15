import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import UserService from '../../services/UserService';
import Swal from 'sweetalert2';

const UserFormModal = ({ isOpen, onClose, isEditMode, user, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('CAJERO');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && user) {
        const parts = (user.fullName || '').trim().split(' ');
        if (parts.length > 1) {
          setFullName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        } else {
          setFullName(user.fullName || '');
          setLastName('');
        }
        setEmail(user.email || '');
        setPassword('');
        setRoleName(user.role?.name || 'CAJERO');
        setIsActive(user.isActive !== false);
      } else {
        setFullName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setRoleName('CAJERO');
        setIsActive(true);
      }
    }
  }, [isOpen, isEditMode, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !lastName.trim() || !email.trim()) {
      Swal.fire('Campos obligatorios', 'Por favor, rellena los campos de nombres, apellidos y correo.', 'warning');
      return;
    }

    if (isEditMode && password.trim() !== '' && password.length < 8) {
      Swal.fire('Contraseña inválida', 'La contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    const userData = {
      fullName,
      lastName,
      email,
      roleName,
      isActive,
      ...(isEditMode && password.trim() !== '' ? { password } : {})
    };

    try {
      if (isEditMode && user) {
        await UserService.update(user.id, userData);
        Swal.fire({
          icon: 'success',
          title: '¡Usuario actualizado!',
          text: 'Los cambios fueron guardados exitosamente.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await UserService.create(userData);
        Swal.fire({
          icon: 'success',
          title: '¡Usuario creado!',
          text: 'El nuevo empleado ha sido registrado y sus credenciales enviadas por correo.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.message || 'Verifica los datos de entrada o si el correo ya existe en el sistema.';
      Swal.fire('Error al guardar', serverMsg, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight">{isEditMode ? 'Modificar Empleado' : 'Nuevo Personal'}</h3>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Configuración de acceso SuperNova</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[var(--app-surface)]">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Nombres</label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Carlos"
              className="w-full px-4 py-3 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-xs text-[var(--app-text)]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Apellidos</label>
            <input
              type="text"
              required
              placeholder="Ej. Pérez Gómez"
              className="w-full px-4 py-3 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-xs text-[var(--app-text)]"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="ejemplo@supernova.com"
              className="w-full px-4 py-3 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-xs text-[var(--app-text)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isEditMode ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Contraseña</label>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20">OPCIONAL</span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] opacity-50" />
                <input
                  type="password"
                  placeholder="Dejar en blanco para conservar actual"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-xs text-[var(--app-text)]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
              <Lock size={18} className="text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider">Contraseña Automatizada</h4>
                <p className="text-[10px] text-[var(--app-text-soft)] font-medium leading-relaxed">
                  Por seguridad, el sistema generará una contraseña temporal compleja y la enviará por correo al empleado de manera inmediata.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">Rol de Sistema</label>
            <select
              className="w-full px-4 py-3 bg-[var(--app-bg-subtle)] border border-[var(--app-border)] rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-xs text-[var(--app-text)] cursor-pointer"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            >
              <option value="CAJERO">CAJERO OPERATIVO</option>
              <option value="BODEGUERO">BODEGUERO (INVENTARIO)</option>
              <option value="SUPERVISOR">SUPERVISOR DE TIENDA</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR GENERAL</option>
              <option value="ADMIN_INGENIERO">INGENIERO DE SISTEMAS</option>
              <option value="CONSULTOR">CONSULTOR EXTERNO</option>
            </select>
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="isActive"
              className="h-5 w-5 rounded-lg text-primary border-[var(--app-border)] focus:ring-primary/20 cursor-pointer bg-[var(--app-bg-subtle)]"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="text-xs font-bold text-[var(--app-text-soft)] cursor-pointer select-none">
              Habilitar acceso inmediato al sistema
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--app-border)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-[var(--app-border)] text-[var(--app-text-soft)] font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[var(--app-bg-subtle)] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} /> {isEditMode ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
