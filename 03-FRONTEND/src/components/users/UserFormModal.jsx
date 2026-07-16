import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import UserService from '../../services/UserService';
import Swal from 'sweetalert2';
import ResponsiveModal from '../ui/ResponsiveModal';
import AuthService from '../../services/AuthService';
import {
  formatPermissionDescription,
  formatPermissionLabel,
  formatRoleLabel,
} from '../../utils/securityLabels';

const ROLE_FALLBACKS = [
  { name: 'CAJERO' },
  { name: 'BODEGUERO' },
  { name: 'SUPERVISOR' },
  { name: 'ADMINISTRADOR' },
  { name: 'ADMIN_INGENIERO' },
  { name: 'CONSULTOR' },
];

const UserFormModal = ({
  isOpen,
  onClose,
  isEditMode,
  user,
  onSuccess,
  roles = [],
  permissions = [],
}) => {
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('CAJERO');
  const [isActive, setIsActive] = useState(true);
  const [directPermissions, setDirectPermissions] = useState([]);

  const availableRoles = roles.length > 0 ? roles : ROLE_FALLBACKS;
  const selectedRole = useMemo(
    () => availableRoles.find((role) => role.name === roleName) || null,
    [availableRoles, roleName]
  );
  const inheritedPermissions = useMemo(
    () => [...new Set(selectedRole?.permissions || [])].sort(),
    [selectedRole]
  );
  const directPermissionOptions = useMemo(
    () =>
      permissions
        .filter((permission) => !inheritedPermissions.includes(permission.code))
        .sort((a, b) => formatPermissionLabel(a.code).localeCompare(formatPermissionLabel(b.code))),
    [permissions, inheritedPermissions]
  );

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
        setDirectPermissions([...(user.directPermissions || [])]);
      } else {
        setFullName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setRoleName('CAJERO');
        setIsActive(true);
        setDirectPermissions([]);
      }
    }
  }, [isOpen, isEditMode, user]);

  if (!isOpen) return null;

  const handleRoleChange = (nextRoleName) => {
    setRoleName(nextRoleName);
    const nextInherited = availableRoles.find((role) => role.name === nextRoleName)?.permissions || [];
    setDirectPermissions((current) => current.filter((code) => !nextInherited.includes(code)));
  };

  const toggleDirectPermission = (permissionCode) => {
    setDirectPermissions((current) =>
      current.includes(permissionCode)
        ? current.filter((code) => code !== permissionCode)
        : [...current, permissionCode].sort()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !lastName.trim() || !email.trim()) {
      Swal.fire('Campos obligatorios', 'Por favor, rellena los campos de nombres, apellidos y correo.', 'warning');
      return;
    }

    const nameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s.'-]+$/;
    if (!nameRegex.test(fullName) || !nameRegex.test(lastName)) {
      Swal.fire('Formato inválido', 'Los nombres y apellidos solo pueden contener letras, espacios, puntos, guiones y apóstrofes.', 'warning');
      return;
    }

    if (isEditMode && password.trim() !== '' && !/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      Swal.fire('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres, incluir al menos 1 letra mayúscula y 1 número.', 'warning');
      return;
    }

    const userData = {
      fullName,
      lastName,
      email,
      roleName,
      isActive,
      directPermissions: directPermissions.filter((code) => !inheritedPermissions.includes(code)),
      ...(isEditMode && password.trim() !== '' ? { password } : {})
    };

    try {
      if (isEditMode && user) {
        await UserService.update(user.id, userData);
        if (String(AuthService.getCurrentUser()?.id) === String(user.id)) {
          await AuthService.refreshCurrentUser();
        }
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
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Lock}
      title={isEditMode ? 'Modificar Empleado' : 'Nuevo Personal'}
      subtitle="Configuración de acceso SuperNova"
      initialSize="lg"
      sizeOptions={['md', 'lg', 'xl']}
      bodyClassName="bg-[var(--app-surface)]"
      headerClassName="bg-gradient-to-r from-primary to-primary-dark text-white"
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
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
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              {availableRoles.map((role) => (
                <option key={role.name} value={role.name}>
                  {formatRoleLabel(role.name).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Permisos heredados del rol
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--app-text-soft)]">
                Estos permisos vienen del rol principal y no se quitan desde este formulario.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {inheritedPermissions.length > 0 ? inheritedPermissions.map((permissionCode) => (
                  <span
                    key={permissionCode}
                    className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600"
                  >
                    {formatPermissionLabel(permissionCode)}
                  </span>
                )) : (
                  <p className="text-xs font-semibold text-[var(--app-text-muted)]">Este rol no tiene permisos heredados configurados.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">
                Permisos adicionales por usuario
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--app-text-soft)]">
                Sirven para dar privilegios extra sin cambiar el rol base. Son solo aditivos.
              </p>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                {directPermissionOptions.length > 0 ? directPermissionOptions.map((permission) => {
                  const checked = directPermissions.includes(permission.code);
                  return (
                    <label
                      key={permission.code}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition ${
                        checked
                          ? 'border-[var(--app-primary)] bg-[var(--app-primary-soft)]/20'
                          : 'border-[var(--app-border)] bg-[var(--app-bg-subtle)]/40 hover:border-[var(--app-primary)]/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDirectPermission(permission.code)}
                        className="mt-1 h-4 w-4 rounded text-[var(--app-primary)] cursor-pointer"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold uppercase tracking-wide text-[var(--app-text)]">
                          {formatPermissionLabel(permission.code)}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-[var(--app-text-muted)]">
                          {formatPermissionDescription(permission.code, permission.description)}
                        </span>
                      </span>
                    </label>
                  );
                }) : (
                  <p className="text-xs font-semibold text-[var(--app-text-muted)]">
                    No hay permisos extra disponibles para este rol.
                  </p>
                )}
              </div>
            </div>
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
        </div>

        <div className="flex gap-3 border-t border-[var(--app-border)] bg-[var(--app-bg-subtle)]/50 p-6">
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
    </ResponsiveModal>
  );
};

export default UserFormModal;
