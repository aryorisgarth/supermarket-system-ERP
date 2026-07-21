import React, { useState, useEffect, useCallback } from 'react';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import useBackendList from '../hooks/useBackendList';
import Swal from 'sweetalert2';

import UsersHeader from '../components/users/UsersHeader';
import UsersTabs from '../components/users/UsersTabs';
import UsersTable from '../components/users/UsersTable';
import RolesPermissionsTab from '../components/users/RolesPermissionsTab';
import UserFormModal from '../components/users/UserFormModal';
import { formatRoleLabel } from '../utils/securityLabels';
import { getApiErrorMessage } from '../utils/apiError';

const Users = () => {
  const loadPage = useCallback((params) => UserService.getPage(params), []);
  const {
    items: users,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  } = useBackendList({ loadPage, sort: 'fullName,asc' });

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [savingRole, setSavingRole] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    fetchAccessConfig();
  }, []);

  const fetchAccessConfig = async () => {
    try {
      const [roleData, permissionData] = await Promise.all([
        UserService.getRoles(),
        UserService.getPermissions(),
      ]);
      setRoles(roleData || []);
      setPermissions(permissionData || []);
      setSelectedRoleId((roleData || []).find((role) => role.name === 'CAJERO')?.id || roleData?.[0]?.id || null);
    } catch (error) {
      console.error('Error fetching access config:', error);
      Swal.fire('Error', 'No se pudieron cargar roles y permisos.', 'error');
    }
  };

  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  const toggleRolePermission = (permissionCode) => {
    if (!selectedRole) return;
    const current = selectedRole.permissions || [];
    const nextPermissions = current.includes(permissionCode)
      ? current.filter((code) => code !== permissionCode)
      : [...current, permissionCode].sort();
    setRoles(roles.map((role) => (
      role.id === selectedRole.id ? { ...role, permissions: nextPermissions } : role
    )));
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    setSavingRole(true);
    try {
      await UserService.updateRolePermissions(selectedRole);
      const currentRole = AuthService.getCurrentUser()?.role?.name;
      if (currentRole === selectedRole.name) {
        await AuthService.refreshCurrentUser();
      }
      Swal.fire({
        icon: 'success',
        title: 'Permisos actualizados',
        text: `Los permisos del rol ${formatRoleLabel(selectedRole.name)} fueron guardados. Los usuarios con ese rol verán los cambios al recargar o al volver a la ventana.`,
        timer: 2800,
        showConfirmButton: false,
      });
      fetchAccessConfig();
    } catch (error) {
      const serverMsg = error.response?.data?.message || 'No se pudieron actualizar los permisos del rol.';
      Swal.fire('Error', serverMsg, 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setShowModal(true);
  };

  const deactivateUser = async (user, { showSuccess = true } = {}) => {
    try {
      await UserService.toggleStatus(user.id);
      if (showSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario desactivado',
          text: `${user.fullName} ya no podrá iniciar sesión, pero su historial se conserva.`,
          timer: 2200,
          showConfirmButton: false,
        });
      }
      reload();
      return true;
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo desactivar el usuario.'), 'error');
      return false;
    }
  };

  const handleToggleStatus = async (user) => {
    const actionText = user.isActive ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿Confirmar acción?`,
      text: `¿Estás seguro de que deseas ${actionText} a ${user.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await UserService.toggleStatus(user.id);
        Swal.fire({
          icon: 'success',
          title: `Usuario ${user.isActive ? 'desactivado' : 'activado'}`,
          timer: 1500,
          showConfirmButton: false
        });
        reload();
      } catch (error) {
        Swal.fire('Error', getApiErrorMessage(error, 'No se pudo cambiar el estado del usuario.'), 'error');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `
        <p>Esta acción es <b>permanente</b> y solo aplica si el usuario no tiene historial.</p>
        <p class="mt-2">Si ya registró ventas, turnos de caja u otras operaciones, use <b>Desactivar</b> en su lugar.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await UserService.delete(user.id);
        Swal.fire({
          icon: 'success',
          title: 'Usuario eliminado',
          timer: 1500,
          showConfirmButton: false
        });
        reload();
      } catch (error) {
        const message = getApiErrorMessage(error, 'No se pudo eliminar el usuario.');
        const canOfferDeactivate = user.isActive !== false && /desactívelo/i.test(message);

        if (canOfferDeactivate) {
          const deactivate = await Swal.fire({
            icon: 'info',
            title: 'Usuario con historial',
            html: `<p>${message}</p><p class="mt-2">En sistemas reales se <b>desactiva</b> al empleado para conservar auditoría y reportes.</p>`,
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Desactivar ahora',
            cancelButtonText: 'Cerrar',
          });
          if (deactivate.isConfirmed) {
            await deactivateUser(user);
          }
          return;
        }

        Swal.fire('Error', message, 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <UsersHeader 
        activeTab={activeTab} 
        onCreateClick={handleOpenCreateModal} 
      />

      <UsersTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {activeTab === 'employees' ? (
        <UsersTable 
          users={users} 
          loading={loading} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          onEdit={handleOpenEditModal} 
          onToggleStatus={handleToggleStatus} 
          onDelete={handleDeleteUser} 
          currentPage={currentPage} 
          totalPages={totalPages} 
          itemsPerPage={itemsPerPage} 
          indexOfFirstItem={indexOfFirstItem} 
          indexOfLastItem={indexOfLastItem} 
          totalItems={totalItems} 
          onPageChange={handlePageChange} 
          onItemsPerPageChange={handleItemsPerPageChange} 
        />
      ) : (
        <RolesPermissionsTab 
          roles={roles} 
          permissions={permissions} 
          selectedRoleId={selectedRoleId} 
          setSelectedRoleId={setSelectedRoleId} 
          selectedRole={selectedRole} 
          savingRole={savingRole} 
          toggleRolePermission={toggleRolePermission} 
          saveRolePermissions={saveRolePermissions} 
        />
      )}

      <UserFormModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        isEditMode={isEditMode} 
        user={selectedUser} 
        onSuccess={reload}
        roles={roles}
        permissions={permissions}
      />
    </div>
  );
};

export default Users;
