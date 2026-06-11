import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, Loader2, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import InventoryCountService from '../../services/InventoryCountService';
import { getApiErrorMessage } from '../../utils/apiError';

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
          <Button type="button" icon={Plus} onClick={startCount} loading={creating}>
            Nuevo conteo
          </Button>
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
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={`/bodega/conteo/${session.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--app-border)] px-4 py-4 transition hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-primary-soft)]/20"
            >
              <div>
                <p className="text-sm font-black text-[var(--app-text)]">{session.sessionCode}</p>
                <p className="text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                  {session.warehouseZone || 'Toda la bodega'} · {session.createdBy?.fullName || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONES[session.status] || 'neutral'}>
                  {STATUS_LABELS[session.status] || session.status}
                </Badge>
                <ArrowRight size={16} className="text-[var(--app-text-muted)]" />
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WarehouseCountList;
