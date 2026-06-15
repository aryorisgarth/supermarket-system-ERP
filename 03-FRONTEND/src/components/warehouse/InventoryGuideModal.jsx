import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Barcode, 
  Building2, 
  ArrowRightLeft, 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Package,
  ScanLine,
  Tag,
  Layers,
  ArrowDown
} from 'lucide-react';

const steps = [
  {
    id: 0,
    title: '1. Codificación de Productos y Presentaciones',
    subtitle: 'Códigos de barras, empaques y unidades de medida (UOM)',
    icon: Package,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    badgeColor: 'bg-rose-50 text-rose-700 border border-rose-100',
    content: (
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          Cada producto tiene un <strong>código de barras base (EAN/UPC)</strong> que identifica la unidad mínima de inventario. Pero cuando un producto se vende o se compra en diferentes <strong>presentaciones</strong> (cajilla, caja, rejilla), cada empaque tiene su <strong>propio código de barras único</strong>.
        </p>

        {/* Visual hierarchy */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            <Layers size={14} /> Ejemplo: Jerarquía del Huevo Blanco
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'UN (Unidad)', code: '7890001', factor: '×1', desc: '1 huevo suelto', color: 'bg-slate-100 border-slate-300 text-slate-700' },
              { label: 'M-CAJ (Media Cajilla)', code: '7890002', factor: '×6', desc: '6 huevos', color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'CAJILLA', code: '7890003', factor: '×30', desc: '30 huevos', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
              { label: 'CAJA', code: '7890004', factor: '×60', desc: '2 cajillas en cartón', color: 'bg-violet-50 border-violet-200 text-violet-700' },
              { label: 'REJILLA', code: '7890005', factor: '×360', desc: '12 cajillas del proveedor', color: 'bg-rose-50 border-rose-200 text-rose-700' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                {idx > 0 && (
                  <div className="flex justify-center">
                    <ArrowDown size={14} className="text-slate-300" />
                  </div>
                )}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${item.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{item.desc}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <code className="text-[10px] font-mono font-bold bg-white/60 px-2 py-0.5 rounded border border-slate-200">{item.code}</code>
                    <span className="text-xs font-extrabold">{item.factor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-emerald-600" />
              <h4 className="font-bold text-sm text-emerald-900">Código Único por Empaque</h4>
            </div>
            <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
              Cada presentación (cajilla de 6, cajilla de 30, caja) tiene su propio <strong>código de barras</strong>. Esto permite escanear directamente el empaque en bodega, conteo y POS.
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <ScanLine size={14} className="text-amber-600" />
              <h4 className="font-bold text-sm text-amber-900">Stock Siempre en Unidad Base</h4>
            </div>
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              El inventario siempre se guarda en <strong>unidades base</strong> (huevos individuales). Si compras 1 rejilla (360), el stock sube +360 UN. Las presentaciones son solo una "vista" del mismo stock.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4.5 flex gap-3.5 items-start">
          <Sparkles className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <p className="text-xs sm:text-sm text-rose-800 font-medium">
            <strong>¿Cómo lo hace un ERP real?</strong> Exactamente igual. SAP y Odoo usan el mismo patrón: un SKU base con <em>Unit of Measure Conversions</em> (UOM). Nuestro sistema replica esta arquitectura profesional con <code className="bg-rose-100 px-1 py-0.5 rounded font-bold">ProductUomConversion</code>.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 1,
    title: '2. Compras (Orden de Compra)',
    subtitle: 'El inicio de la mercadería',
    icon: ShoppingCart,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-100',
    content: (
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          Todo el ciclo comienza en el departamento de Compras. El administrador crea una <strong>Orden de Compra (OC)</strong> oficial en el sistema, detallando:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold text-slate-700">
          <li className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Selección de Proveedor Autorizado</span>
          </li>
          <li className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Desglose de productos y presentación</span>
          </li>
          <li className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Precios pactados por Empaque</span>
          </li>
          <li className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span>Conversión automática a unidades base</span>
          </li>
        </ul>
        
        {/* Purchase conversion example */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/30 p-5 space-y-3">
          <p className="text-xs font-extrabold text-blue-900 uppercase tracking-widest">Ejemplo: Comprar 2 Cajas de Huevos</p>
          <div className="space-y-2 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2 p-2.5 bg-white/80 rounded-lg border border-blue-100">
              <span className="text-blue-600">1.</span> Proveedor: <span className="text-blue-800">Granja El Pollo</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white/80 rounded-lg border border-blue-100">
              <span className="text-blue-600">2.</span> Producto: <span className="text-blue-800">Huevo Blanco</span> · Empaque: <span className="text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">CAJA (×60)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white/80 rounded-lg border border-blue-100">
              <span className="text-blue-600">3.</span> Cantidad: <span className="text-blue-800">2 cajas</span> × Q120 c/u = <span className="text-emerald-700 font-extrabold">Q240.00</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-600">→</span> <span className="text-emerald-800">Sistema calcula: 2 × 60 = <strong>120 huevos al stock</strong></span> · Costo: Q240÷120 = <span className="text-emerald-700">Q2.00/huevo</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4.5 flex gap-3.5 items-start">
          <Sparkles className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <p className="text-xs sm:text-sm text-blue-800 font-medium">
            <strong>Consejo de Productividad:</strong> Al crear compras, usa el modo tabla para registrar decenas de productos de forma rápida con el teclado sin tener que usar el mouse constantemente.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: '3. Recepción Física en Bodega',
    subtitle: 'Lotes, Vencimientos y Control de Calidad',
    icon: Barcode,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-100',
    content: (
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          Cuando el camión del proveedor descarga en el muelle del supermercado, el operario de Bodega abre la OC seleccionada y registra la entrada física:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">A</div>
            <h4 className="font-bold text-sm text-slate-900">Escaneo Rápido</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">Escanea los códigos de barra de los empaques o productos con lector USB para verificar de forma ágil contra la orden lógica.</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">B</div>
            <h4 className="font-bold text-sm text-slate-900">Registro PEPS (Lotes)</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">Es obligatorio capturar el código del lote y la fecha de vencimiento. Esto previene pérdidas por vencimientos anticipados.</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">C</div>
            <h4 className="font-bold text-sm text-slate-900">Control de Calidad</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">Registra notas si la mercadería vino golpeada, incompleta o en malas condiciones de temperatura antes de guardarla.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: '4. Ubicación y Codificación Semántica',
    subtitle: 'Almacenamiento Inteligente y Prevención de Duplicados',
    icon: Building2,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    content: (
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          Una vez recibida la mercadería, el stock lógico se almacena usando una <strong>Codificación Semántica Inteligente</strong> para evitar confusiones de ubicación:
        </p>
        <ul className="space-y-4 text-sm font-semibold text-slate-700">
          <li className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">Estructura del Código: `[ÁREA]-[PASILLO]-[CATEGORÍA/SUBÁREA]-[TIPO/MUEBLE]-[NIVEL]`</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                El sistema genera automáticamente el código traduciendo tus opciones a abreviaturas de 3 letras estándar (ej. Nevera → <strong>NEV</strong>, Estante → <strong>EST</strong>, Góndola → <strong>GON</strong>, Bebidas → <strong>BEB</strong>). Ejemplo: <code className="bg-slate-200 px-1 py-0.5 rounded text-emerald-700 font-bold">PV-PAS1_BEB-NEV_COCA-N2</code>.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">Control Estricto de Duplicados (Comparación de Código)</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                No se permiten dos ubicaciones idénticas (ej. no puedes tener dos <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-700 font-bold">PV-PAS1_BEB-NEV_COCA-N2</code>). El sistema realiza una comparación en tiempo real contra los registros existentes en la base de datos para garantizar la integridad y evitar errores de inventario.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-bold text-slate-900 text-sm">Restricción de Reserva</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                El stock en ubicaciones de Bodega Central (<code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">is_piso_venta = false</code>) se considera en reserva y no está disponible para venta directa en el POS (Cajas), previniendo descuadres.
              </p>
            </div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    title: '5. Traslado Interno al Piso de Venta',
    subtitle: 'El paso final para habilitar la venta',
    icon: ArrowRightLeft,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    content: (
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          Para que los clientes puedan comprar y el cajero pueda facturar un producto, el stock físico debe ser trasladado al <strong>Piso de Venta</strong> (exhibición en góndolas, neveras abiertas, estantes, etc.).
        </p>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between gap-4 text-xs font-extrabold text-slate-900">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">Ubicación Bodega</span>
            <ArrowRight className="text-indigo-500" size={16} />
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 border border-blue-500/20">Piso de Venta (Exhibición)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Desde la pantalla de inventario de stock por ubicación, los operarios realizan un **Traslado de Mercadería**. Esto resta stock de la Bodega y lo suma en el Piso de Venta (<code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700">is_piso_venta = true</code>).
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4.5 flex gap-3.5 items-start">
          <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
          <p className="text-xs sm:text-sm text-indigo-800 font-medium">
            <strong>Alerta de Stock Bajo:</strong> Si el stock en el Piso de Venta cae por debajo del mínimo de exhibición (ej. menos de 5 unidades), el sistema emitirá una alerta visual automática para solicitar reabastecimiento inmediato desde la Bodega Central.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: '6. Auditoría y Conteo Cíclico (Cuadre)',
    subtitle: 'Escaneo multi-barcode y ajuste automático',
    icon: ClipboardCheck,
    color: 'from-violet-500 to-rose-600',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    badgeColor: 'bg-violet-50 text-violet-700 border border-violet-100',
    content: (
      <div className="space-y-5">
        <p className="text-base text-slate-700 leading-relaxed">
          Periódicamente, para auditar pérdidas, robos o desajustes, se inicia una <strong>Sesión de Conteo Físico</strong> en Bodega:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500"></span> Conteo del Operario
            </h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              El operario va pasillo por pasillo <strong>escaneando cualquier código de barras</strong> — ya sea el del huevo suelto o el de la cajilla. El sistema reconoce automáticamente la presentación y multiplica por el factor correspondiente.
            </p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Aprobación y Ajuste
            </h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              El supervisor revisa las variaciones (lógico vs físico). Al <strong>Aprobar el Conteo</strong>, el sistema genera los movimientos Kardex de ajuste y cuadra de forma automática el inventario a su valor real.
            </p>
          </div>
        </div>

        {/* Scan example */}
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50/30 p-5 space-y-3">
          <p className="text-xs font-extrabold text-violet-900 uppercase tracking-widest flex items-center gap-2">
            <ScanLine size={14} /> Ejemplo de Conteo Multi-Barcode
          </p>
          <div className="space-y-1.5 text-xs font-bold text-slate-700">
            <div className="flex items-center justify-between p-2 bg-white/80 rounded-lg border border-violet-100">
              <span>Escaneo 1: <code className="text-violet-700 bg-violet-100 px-1.5 rounded">7890003</code> (CAJILLA ×30)</span>
              <span className="text-emerald-700">+30 UN</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/80 rounded-lg border border-violet-100">
              <span>Escaneo 2: <code className="text-violet-700 bg-violet-100 px-1.5 rounded">7890003</code> (CAJILLA ×30)</span>
              <span className="text-emerald-700">+30 UN</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/80 rounded-lg border border-violet-100">
              <span>Escaneo 3: <code className="text-blue-700 bg-blue-100 px-1.5 rounded">7890001</code> (UN ×1) cant: 5</span>
              <span className="text-emerald-700">+5 UN</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-violet-100 rounded-lg border border-violet-300 text-violet-900">
              <span>Total contado:</span>
              <span className="text-lg font-extrabold">65 huevos</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

const InventoryGuideModal = ({ isOpen, onClose, initialStep = 0 }) => {
  const [activeStep, setActiveStep] = useState(initialStep);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(initialStep);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const current = steps[activeStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[95vw] max-w-[1400px] overflow-hidden flex flex-col md:flex-row min-h-[70vh] max-h-[90vh] text-slate-900">
        {/* Sidebar */}
        <div className="w-full md:w-88 bg-slate-50 border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                <Play size={10} className="fill-indigo-600 text-indigo-600" />
                Flujo Operativo
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Guía del Inventario</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Módulos de Bodega y Productos</p>
            </div>

            <div className="space-y-2">
              {steps.map((s, idx) => {
                const isActive = activeStep === idx;
                const isCompleted = idx < activeStep;
                const StepIcon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white border border-slate-200 shadow-md' 
                        : 'hover:bg-slate-200/50 border border-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? `bg-gradient-to-r ${s.color} text-white shadow-sm` 
                        : isCompleted
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                    }`}>
                      <StepIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {s.title.substring(3)}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide truncate mt-0.5">{s.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Examen de Grado · Adolfo F.
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-between bg-white relative overflow-hidden text-slate-900">
          {/* Subtle light background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${current.badgeColor}`}>
                Paso {activeStep + 1} de {steps.length}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">
                {current.subtitle}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step content */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${current.color} text-white flex items-center justify-center shadow-lg shadow-indigo-500/10`}>
                <Icon size={26} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">{current.title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">{current.subtitle}</p>
              </div>
            </div>

            {current.content}
          </div>

          {/* Footer buttons */}
          <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeStep === 0}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            {activeStep === steps.length - 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                ¡Entendido! <ShieldCheck size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryGuideModal;
