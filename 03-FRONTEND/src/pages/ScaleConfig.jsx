import React, { useState, useEffect } from 'react';
import { Save, Scale } from 'lucide-react';
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
        title: 'Éxito',
        text: 'Configuración actualizada correctamente.',
        timer: 2000,
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
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <Scale className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Configuración de Balanza</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefijo (ej. 20)
              </label>
              <input
                type="text"
                name="prefix"
                value={config.prefix}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largo del PLU
              </label>
              <input
                type="number"
                name="pluLength"
                value={config.pluLength}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largo del Peso
              </label>
              <input
                type="number"
                name="weightLength"
                value={config.weightLength}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Divisor de Peso (ej. 1000 para kg)
              </label>
              <input
                type="number"
                name="divisor"
                value={config.divisor}
                onChange={handleChange}
                required
                step="0.01"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScaleConfig;
