import React from 'react';
import {
  Sparkles,
  Save,
  Loader2,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';

const CommercialGoalsTab = ({
  showGoalForm,
  setShowGoalForm,
  goalForm,
  setGoalForm,
  handleCreateGoal,
  savingGoal,
  loadingGoals,
  goals,
  money,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Formulario de Creación de Metas */}
      {showGoalForm && (
        <div className="bg-white/95 border border-amber-200 rounded-3xl p-6 shadow-xl max-w-xl animate-fade-in">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
            <Sparkles className="text-amber-500" size={20} />
            Registrar Nueva Meta Comercial
          </h3>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <label className="grid gap-1">
              <span className="text-xs font-bold text-slate-500">Nombre de la Meta</span>
              <input
                type="text"
                required
                placeholder="Ej. Meta de Ventas de Junio 2026"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                className="ui-input min-h-10 text-sm font-semibold"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-500">Monto Objetivo (C$)</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="150000"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  className="ui-input min-h-10 text-sm font-bold"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-500">Tipo de Temporalidad</span>
                <select
                  value={goalForm.goalType}
                  onChange={(e) => setGoalForm({ ...goalForm, goalType: e.target.value })}
                  className="ui-input ui-select min-h-10 text-sm font-bold"
                >
                  <option value="DAILY">Diaria</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                  <option value="ANNUAL">Anual</option>
                  <option value="CUSTOM">Personalizada</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-500">Fecha de Inicio</span>
                <input
                  type="datetime-local"
                  required
                  value={goalForm.startDate}
                  onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                  className="ui-input min-h-10 text-sm font-semibold"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-500">Fecha de Cierre</span>
                <input
                  type="datetime-local"
                  required
                  value={goalForm.endDate}
                  onChange={(e) => setGoalForm({ ...goalForm, endDate: e.target.value })}
                  className="ui-input min-h-10 text-sm font-semibold"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={savingGoal}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-strong disabled:opacity-50 text-sm shadow-md"
              >
                <Save size={16} /> {savingGoal ? 'Guardando...' : 'Guardar Meta'}
              </button>
              <button
                type="button"
                onClick={() => setShowGoalForm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cargador e Indicadores de Metas */}
      {loadingGoals ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="font-semibold text-sm">Cargando metas comerciales y sumando ventas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const progress = Math.min(Number(g.progressPercent) || 0, 100);
            const target = Number(g.targetAmount) || 0;
            const actual = Number(g.actualAmount) || 0;
            const typeLabel = {
              DAILY: 'Diaria',
              WEEKLY: 'Semanal',
              MONTHLY: 'Mensual',
              ANNUAL: 'Anual',
              CUSTOM: 'Personalizada',
            }[g.goalType];

            // Determinar el color del progreso y tema
            let themeColor = 'from-blue-500 to-indigo-600';
            let bgSoft = 'bg-blue-50 text-blue-700 border-blue-200';
            if (g.isAchieved || g.status === 'COMPLETED') {
              themeColor = 'from-emerald-500 to-teal-600';
              bgSoft = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            } else if (g.status === 'FAILED') {
              themeColor = 'from-rose-500 to-red-600';
              bgSoft = 'bg-rose-50 text-rose-700 border-rose-200';
            } else if (progress > 50) {
              themeColor = 'from-amber-500 to-orange-600';
              bgSoft = 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return (
              <div
                key={g.goalId}
                className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${bgSoft}`}>
                        {typeLabel}
                      </span>
                      <h4 className="font-black text-slate-800 text-base mt-2 group-hover:text-primary transition-colors leading-tight">
                        {g.name}
                      </h4>
                    </div>
                    <span className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary-soft group-hover:text-primary transition-all">
                      <Target size={20} />
                    </span>
                  </div>

                  {/* Progreso Visual en Anillo/Barra */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wide">Progreso ({progress.toFixed(1)}%)</span>
                      <span className="text-slate-700">{money(actual)}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3.5 border border-slate-200/40 p-0.5 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${themeColor} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-0.5">
                      <span>Objetivo: {money(target)}</span>
                      <span>{g.isAchieved ? '¡Logrado!' : `Faltan ${money(Math.max(0, target - actual))}`}</span>
                    </div>
                  </div>
                </div>

                {/* Footer con fechas y estados */}
                <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(g.endDate).toLocaleDateString('es-NI', { day: '2-digit', month: 'short' })}
                  </span>

                  {/* Estado Operativo */}
                  {g.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle size={12} /> Completada
                    </span>
                  )}
                  {g.status === 'FAILED' && (
                    <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 text-[10px] font-bold">
                      <AlertCircle size={12} /> Incumplida
                    </span>
                  )}
                  {g.status === 'ACTIVE' && (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 text-[10px] font-bold">
                      <Clock size={12} /> {g.daysRemaining} {g.daysRemaining === 1 ? 'día' : 'días'} restante{g.daysRemaining === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl py-16 text-center">
              <Target size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-500">No hay metas comerciales registradas</p>
              <p className="mt-1 text-xs text-slate-400">
                Define objetivos de ventas por día, semana o mes y el sistema calculará el avance automáticamente.
              </p>
              <button
                type="button"
                onClick={() => setShowGoalForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-strong"
              >
                <Plus size={16} /> Crear primera meta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommercialGoalsTab;
