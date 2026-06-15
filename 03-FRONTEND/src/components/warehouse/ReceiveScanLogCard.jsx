import React from 'react';
import Card from '../ui/Card';
import { Activity, Sparkles, Barcode, Clock } from 'lucide-react';

const ReceiveScanLogCard = ({ scanLog }) => {
  return (
    <Card className="border-[var(--app-border)]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-500 animate-pulse" size={16} />
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Historial en Vivo
          </h4>
        </div>
        <Sparkles size={13} className="text-indigo-500" />
      </div>

      {scanLog.length === 0 ? (
        <div className="py-6 text-center text-[10px] text-[var(--app-text-muted)] font-bold border-2 border-dashed border-[var(--app-border)] rounded-2xl">
          Esperando escaneos...
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {scanLog.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 p-2.5 bg-[var(--app-bg-subtle)]/60 border border-[var(--app-border)] rounded-xl text-[10px] animate-fade-in"
            >
              <Barcode size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--app-text)] truncate">{log.productName}</p>
                <div className="flex justify-between text-[9px] text-[var(--app-text-muted)] mt-0.5">
                  <span className="font-mono">{log.barcode}</span>
                  <span className="font-bold text-indigo-600">+{log.qty} u</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[8px] text-[var(--app-text-muted)] font-bold bg-[var(--app-surface)] px-1 py-0.5 rounded border border-[var(--app-border)] shrink-0">
                <Clock size={8} /> {log.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ReceiveScanLogCard;
