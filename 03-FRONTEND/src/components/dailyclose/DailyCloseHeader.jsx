import React from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Printer, CalendarDays } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const DailyCloseHeader = ({
  date,
  officialClosure,
  closing,
  onRefresh,
  onCloseOfficially,
  onPrint
}) => {
  return (
    <PageHeader
      eyebrow="Operación diaria"
      title="Cierre del Día"
      description="Acta operativa con ventas, cajas, compras, liquidaciones y alertas para cierre administrativo."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={onRefresh}>Actualizar</Button>
          <Button
            variant={officialClosure ? 'secondary' : 'success'}
            icon={officialClosure ? CheckCircle2 : ShieldCheck}
            onClick={onCloseOfficially}
            disabled={closing || Boolean(officialClosure)}
          >
            {officialClosure ? 'Cierre guardado' : closing ? 'Guardando...' : 'Cerrar oficialmente'}
          </Button>
          <Button icon={Printer} onClick={onPrint}>Imprimir acta</Button>
        </div>
      }
      meta={
        <Badge tone={officialClosure ? 'green' : 'blue'} icon={officialClosure ? CheckCircle2 : CalendarDays}>
          {officialClosure ? 'Oficial' : date}
        </Badge>
      }
    />
  );
};

export default DailyCloseHeader;
