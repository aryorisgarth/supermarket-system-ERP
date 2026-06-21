import React, { useState, useEffect } from 'react';
import { Save, Scale, Info, CheckCircle2, ChevronRight, Barcode } from 'lucide-react';
import Swal from 'sweetalert2';
import ScaleConfigService from '../services/ScaleConfigService';

const ScaleConfig = () => {
  const [config, setConfig] = useState({
    id: null,
    prefix: '20',
    pluLength: 5,
    weightLength: 5,
    divisor: 1000,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await ScaleConfigService.getConfig();
      if (data) {
        setConfig({
          id: data.id,
          prefix: data.prefix,
          pluLength: data.pluLength,
          weightLength: data.weightLength,
          divisor: data.divisor,
        });
      }
    } catch (error) {
      console.error('Error loading scale config', error);
      Swal.fire('Error', 'No se pudo cargar la configuración de la balanza.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...config,
        pluLength: parseInt(config.pluLength, 10),
        weightLength: parseInt(config.weightLength, 10),
        divisor: parseFloat(config.divisor),
      };
      await ScaleConfigService.updateConfig(payload);
      Swal.fire({
        icon: 'success',
        title: '¡Configuración Guardada!',
        text: 'Los parámetros de la balanza han sido actualizados en todo el sistema.',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating scale config', error);
      Swal.fire('Error', 'No se pudo actualizar la configuración.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  // Ejemplo simulado basado en la config actual
  const prefixExample = config.prefix || '20';
  const pluExample = '0'.repeat(Math.max(0, parseInt(config.pluLength || 5) - 4)) + '1234'.slice(0, parseInt(config.pluLength || 5));
  const weightExample = '0'.repeat(Math.max(0, parseInt(config.weightLength || 5) - 4)) + '1500'.slice(0, parseInt(config.weightLength || 5));
  const totalLength = prefixExample.length + (parseInt(config.pluLength) || 0) + (parseInt(config.weightLength) || 0) + 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in-up">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg mr-4 shadow-sm">
          <Scale size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Configuración de Balanza</h1>
          <p className="text-gray-500 mt-1">
            Adapta el formato de los códigos de barra generados por las balanzas de tu supermercado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado izquierdo: Formulario */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <form onSubmit={handleSubmit} className="p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <Save className="mr-2 text-indigo-500" size={20} /> Parámetros del Código
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                    Prefijo Identificador
                  </label>
                  <input
                    type="text"
                    name="prefix"
                    value={config.prefix}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="ej. 20"
                  />
                  <p className="text-xs text-gray-400 mt-2">Dígitos con los que inicia todo producto pesable.</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-purple-600">
                    Largo del PLU (Código)
                  </label>
                  <input
                    type="number"
                    name="pluLength"
                    value={config.pluLength}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">Cantidad de dígitos que representan el ID.</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-green-600">
                    Largo del Peso
                  </label>
                  <input
                    type="number"
                    name="weightLength"
                    value={config.weightLength}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">Dígitos reservados para el peso.</p>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-pink-600">
                    Divisor (Decimales)
                  </label>
                  <input
                    type="number"
                    name="divisor"
                    value={config.divisor}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">Ej. 1000 = divide el peso entre 1000 (Kg).</p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="relative overflow-hidden group flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  ) : (
                    <Save className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  )}
                  {saving ? 'Guardando en BD...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lado derecho: Guía Visual */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <Barcode size={150} />
            </div>
            
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Info className="mr-2 text-indigo-400" size={22} />
              Previsualización de Trama
            </h3>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Así es como el sistema Punto de Venta desarmará el código de barras cuando pase por el escáner:
            </p>

            <div className="flex flex-col space-y-3">
              {/* Desglose visual */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Trama de {totalLength} dígitos</span>
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">Ejemplo</span>
                </div>
                
                <div className="flex flex-wrap text-2xl font-mono font-bold tracking-[0.2em] mb-4 bg-slate-950 py-3 px-4 rounded-lg border border-slate-800 shadow-inner">
                  <span className="text-indigo-400" title="Prefijo">{prefixExample}</span>
                  <span className="text-purple-400" title="PLU (Producto)">{pluExample}</span>
                  <span className="text-green-400" title="Peso sin dividir">{weightExample}</span>
                  <span className="text-pink-400" title="Dígito Verificador">8</span>
                </div>

                <div className="space-y-2 text-sm mt-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 rounded-full bg-indigo-400 mt-1 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-indigo-300">Prefijo ({prefixExample.length} dígitos): </span> 
                      <span className="text-slate-300">Indica que es un peso.</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-1 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-purple-300">PLU ({config.pluLength} dígitos): </span> 
                      <span className="text-slate-300">Código del producto <span className="bg-slate-700 px-1 rounded font-mono text-xs">{pluExample}</span>.</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 rounded-full bg-green-400 mt-1 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-green-300">Peso ({config.weightLength} dígitos): </span> 
                      <span className="text-slate-300">
                        Se dividirá por {config.divisor} <ChevronRight className="inline" size={14}/> 
                        <span className="text-green-200 font-bold ml-1">
                          {(parseInt(weightExample) / parseFloat(config.divisor || 1)).toFixed(3)} Kg
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 rounded-full bg-pink-400 mt-1 mr-3 flex-shrink-0"></div>
                    <div>
                      <span className="font-semibold text-pink-300">Dígito Final (1 dígito): </span> 
                      <span className="text-slate-300">Check-digit EAN.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Adicionales */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
            <h4 className="font-semibold text-blue-800 flex items-center mb-3">
              <CheckCircle2 size={18} className="mr-2" /> Recomendaciones
            </h4>
            <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
              <li>Asegúrate de configurar la <strong>Balanza Física</strong> (Dibal, Torrey, CAS) exactamente con esta misma regla EAN-13.</li>
              <li>Si tu balanza imprime el peso en gramos en lugar de Kilogramos, ajusta el <strong>Divisor a 1</strong>.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScaleConfig;
