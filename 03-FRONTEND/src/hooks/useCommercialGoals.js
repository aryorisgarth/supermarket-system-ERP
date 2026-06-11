import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import CommercialGoalService from '../services/CommercialGoalService';

export const useCommercialGoals = (activeTab) => {
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    goalType: 'MONTHLY',
    startDate: '',
    endDate: '',
  });

  const fetchGoals = async () => {
    setLoadingGoals(true);
    try {
      const data = await CommercialGoalService.getAllPerformance();
      setGoals(data || []);
    } catch (error) {
      console.error('Error cargando metas:', error);
      Swal.fire('Error', 'No se pudieron cargar las metas comerciales.', 'error');
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'GOALS') {
      fetchGoals();
    }
  }, [activeTab]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const target = parseFloat(goalForm.targetAmount);
    if (isNaN(target) || target <= 0) {
      Swal.fire('Monto Inválido', 'El monto objetivo debe ser mayor a cero.', 'warning');
      return;
    }
    if (!goalForm.startDate || !goalForm.endDate) {
      Swal.fire('Fechas Requeridas', 'Debes seleccionar fecha de inicio y fin.', 'warning');
      return;
    }
    if (new Date(goalForm.startDate) >= new Date(goalForm.endDate)) {
      Swal.fire('Error de Fechas', 'La fecha de inicio debe ser anterior a la fecha de fin.', 'warning');
      return;
    }

    setSavingGoal(true);
    try {
      await CommercialGoalService.create({
        name: goalForm.name,
        targetAmount: target,
        goalType: goalForm.goalType,
        startDate: new Date(goalForm.startDate).toISOString(),
        endDate: new Date(goalForm.endDate).toISOString(),
        status: 'ACTIVE',
      });
      Swal.fire({
        icon: 'success',
        title: 'Meta Creada',
        text: 'La meta comercial se ha registrado exitosamente.',
        timer: 1600,
        showConfirmButton: false,
      });
      setGoalForm({
        name: '',
        targetAmount: '',
        goalType: 'MONTHLY',
        startDate: '',
        endDate: '',
      });
      setShowGoalForm(false);
      fetchGoals();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar la meta comercial.', 'error');
    } finally {
      setSavingGoal(false);
    }
  };

  return {
    goals,
    loadingGoals,
    showGoalForm,
    setShowGoalForm,
    savingGoal,
    goalForm,
    setGoalForm,
    handleCreateGoal,
    reloadGoals: fetchGoals,
  };
};

export default useCommercialGoals;
