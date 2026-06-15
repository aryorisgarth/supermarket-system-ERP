import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Loader2, Plus, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import InventoryCountService from '../../services/InventoryCountService';
import AuthService from '../../services/AuthService';
import { getApiErrorMessage } from '../../utils/apiError';
import InventoryGuideModal from '../../components/warehouse/InventoryGuideModal';

const STATUS_LABELS = {
  OPEN: 'Abierto',
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprobado',
  CANCELLED: 'Cancelado',
};

const STATUS_TONES = {
  OPEN: 'blue',
  SUBMITTED: 'amber',
  APPROVED: 'green',
  CANCELLED: 'neutral',
};

const WarehouseCountList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [showGuideModal, setShowGuideModal] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await InventoryCountService.getPage({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: 0,
        size: 50,
        sort: 'createdAt,desc',
      });
      setSessions(data?.content || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const startCount = async () => {
    const { value: warehouseZone } = await Swal.fire({
      title: 'Nuevo conteo cíclico',
      input: 'text',
      inputLabel: 'Zona de bodega (opcional)',
      inputPlaceholder: 'Ej. A-01, Perecederos',
      showCancelButton: true,
      confirmButtonText: 'Iniciar conteo',
      cancelButtonText: 'Cancelar',
    });
    if (warehouseZone === undefined) return;

    try {
      setCreating(true);
      const session = await InventoryCountService.create({
        warehouseZone: warehouseZone?.trim() || undefined,
        notes: 'Conteo cíclico en bodega',
      });
      navigate(`/bodega/conteo/${session.id}`);
    } catch (error) {
      Swal.fire('Error', getApiErrorMessage(error, 'No se pudo crear el conteo.'), 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Bodega"
        title="Conteo cíclico"
        description="Escanea productos, compara con el stock del sistema y envía el conteo para aprobación."
        actions={(
          <div className="flex gap-2">
            <Button type="button" variant="secondary" icon={BookOpen} onClick={() => setShowGuideModal(true)}>
              Guía de Conteo
            </Button>
            <Button type="button" icon={Plus} onClick={startCount} loading={creating}>
              Nuevo conteo
            </Button>
          </div>
        )}
        meta={<Badge tone="blue">{sessions.length} sesiones</Badge>}
      />

      <Card>
        <CardHeader icon={ClipboardCheck} title="Sesiones de conteo" />
        <div className="mt-4 max-w-xs">
          <select
            className="ui-input ui-select w-full text-xs font-bold"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
              <Loader2 size={14} className="animate-spin" /> Cargando...
            </div>
          )}
          {!loading && sessions.length === 0 && (
            <p className="text-xs text-[var(--app-text-muted)]">No hay sesiones de conteo.</p>
          )}
          {sessions.map((session) => {
            const isMine = session.countedBy?.id === AuthService.getCurrentUser()?.id;
            const isTaken = !!session.countedBy && !isMine;
            const isAdmin = AuthService.hasPermission('ADMIN') || AuthService.getCurrentUser()?.role?.name?.includes('ADMIN');
            const isOpen = session.status === 'OPEN';

            return (
              <div
                key={session.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] px-4 py-4 bg-[var(--app-surface)]"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--app-text)]">{session.sessionCode}</p>
                  <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                    {session.warehouseZone || 'Toda la bodega'} · Creado por: {session.createdBy?.fullName || '—'}
                  </p>
                  {session.countedBy ? (
                    <p className="text-[10px] font-bold uppercase text-[var(--app-primary)] mt-1">
                      Responsable: {session.countedBy.fullName || session.countedBy.email}
                    </p>
                  ) : isOpen ? (
                    <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] mt-1">
                      Sin asignar
                    </p>
                  ) : null}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={STATUS_TONES[session.status] || 'neutral'}>
                    {STATUS_LABELS[session.status] || session.status}
                  </Badge>

                  {isOpen && (
                    <div className="flex items-center gap-2">
                      {isTaken ? (
                        <>
                          <button disabled className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs font-bold rounded-lg cursor-not-allowed">
                            En proceso
                          </button>
                          {isAdmin && (
                            <button
                              onClick={async () => {
                                const { value: userId } = await Swal.fire({
                                  title: 'Reasignar Conteo',
                                  input: 'number',
                                  inputLabel: 'ID del nuevo responsable',
                                  showCancelButton: true
                                });
                                if (userId) {
                                  try {
                                    await InventoryCountService.assign(session.id, parseInt(userId));
                                    Swal.fire('Asignado', 'Conteo reasignado', 'success').then(() => loadSessions());
                                  } catch (err) {
                                    Swal.fire('Error', 'No se pudo reasignar', 'error');
                                  }
                                }
                              }}
                              className="px-2 py-1.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg hover:bg-red-200 transition"
                            >
                              Reasignar
                            </button>
                          )}
                        </>
                      ) : isMine ? (
                        <button
                          onClick={() => navigate(`/bodega/conteo/${session.id}`)}
                          className="px-3 py-1.5 bg-[var(--app-primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-blue-700 transition"
                        >
                          Continuar <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await InventoryCountService.claim(session.id);
                              Swal.fire('Éxito', 'Has tomado este conteo', 'success').then(() => navigate(`/bodega/conteo/${session.id}`));
                            } catch (err) {
                              Swal.fire('Error', 'No se pudo tomar la tarea', 'error');
                            }
                          }}
                          className="px-3 py-1.5 bg-[var(--app-text)] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-gray-800 transition"
                        >
                          Tomar Tarea <ClipboardCheck size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {!isOpen && (
                    <button
                      onClick={() => navigate(`/bodega/conteo/${session.id}`)}
                      className="px-3 py-1.5 bg-[var(--app-bg-subtle)] text-[var(--app-text)] text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-gray-200 transition"
                    >
                      Ver Detalle <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <InventoryGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialStep={4}
      />
    </div>
  );
};

export default WarehouseCountList;
