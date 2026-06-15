import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, MapPin, Layers, Search, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';

import LocationService from '../services/LocationService';

import LocationsVisualMap from '../components/locations/LocationsVisualMap';
import LocationDetailsDrawer from '../components/locations/LocationDetailsDrawer';
import LocationsTable from '../components/locations/LocationsTable';
import LocationFormModal from '../components/locations/LocationFormModal';
import InventoryGuideModal from '../components/warehouse/InventoryGuideModal';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  
  const [activeTab, setActiveTab] = useState('MAP');

  
  const [selectedMapLoc, setSelectedMapLoc] = useState(null);
  const [mapLocProducts, setMapLocProducts] = useState([]);
  const [loadingMapProducts, setLoadingMapProducts] = useState(false);

  const [warehouse, setWarehouse] = useState('');
  const [aisle, setAisle] = useState('');
  const [shelf, setShelf] = useState('');
  const [level, setLevel] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [isPisoVenta, setIsPisoVenta] = useState(false);

  // Auto-generación inteligente del código de ubicación en tiempo real al crear
  useEffect(() => {
    if (editingLocation) return;

    const parseField = (text, defaultPrefix) => {
      let clean = text.trim().toUpperCase();
      if (!clean) return '';

      // Reemplazos de palabras comunes a códigos estándar
      clean = clean.replace('BODEGA', 'BOD');
      clean = clean.replace('ALMACEN', 'ALM');
      clean = clean.replace('NEVERA', 'NEV');
      clean = clean.replace('ESTANTE', 'EST');
      clean = clean.replace('MESA', 'MES');
      clean = clean.replace('CONGELADOR', 'CON');
      clean = clean.replace('EXHIBIDOR', 'EXH');

      // Abreviaciones de categorías o zonas comunes
      clean = clean.replace('BEBIDAS', 'BEB');
      clean = clean.replace('FRUTAS', 'FRU');
      clean = clean.replace('VERDURAS', 'VER');
      clean = clean.replace('DESPENSA', 'DES');
      clean = clean.replace('LACTEOS', 'LAC');
      clean = clean.replace('CARNES', 'CAR');
      clean = clean.replace('LIMPIEZA', 'LIM');
      clean = clean.replace('PANADERIA', 'PAN');
      clean = clean.replace('COCA-COLA', 'COCA');
      clean = clean.replace('COCACOLA', 'COCA');

      // Formato para Pasillo X -> PASX y Nivel Y -> NY
      clean = clean.replace(/PASILLO\s*(\d+)/g, 'PAS$1');
      clean = clean.replace(/NIVEL\s*(\d+)/g, 'N$1');

      // Si el campo es solo un número, le agregamos el prefijo por defecto
      if (/^\d+$/.test(clean) && defaultPrefix) {
        return `${defaultPrefix}${clean}`;
      }

      // Limpiar caracteres no deseados y unir con guión bajo
      return clean
        .replace(/[\s()-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    };

    const w = warehouse.trim().toUpperCase();
    let prefix = '';
    if (w.includes('PISO') && w.includes('VENTA')) {
      prefix = 'PV';
    } else {
      prefix = parseField(warehouse, '');
    }

    const parts = [];
    if (prefix) parts.push(prefix);

    const parsedAisle = parseField(aisle, 'PAS');
    if (parsedAisle) parts.push(parsedAisle);

    const parsedShelf = parseField(shelf, 'EST');
    if (parsedShelf) parts.push(parsedShelf);

    const parsedLevel = parseField(level, 'N');
    if (parsedLevel) parts.push(parsedLevel);

    setLocationCode(parts.join('-'));
  }, [warehouse, aisle, shelf, level, editingLocation]);

  // Validar si el código generado o ingresado ya existe en la base de datos
  const isDuplicateCode = useMemo(() => {
    if (!locationCode.trim()) return false;
    return locations.some(
      (loc) =>
        loc.locationCode?.trim().toUpperCase() === locationCode.trim().toUpperCase() &&
        loc.id !== editingLocation?.id
    );
  }, [locationCode, locations, editingLocation]);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await LocationService.getAll();
      setLocations(data || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las ubicaciones.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  
  const handleSelectMapLocation = async (loc) => {
    setSelectedMapLoc(loc);
    setLoadingMapProducts(true);
    try {
      const productsData = await LocationService.getProductsByLocation(loc.id);
      setMapLocProducts(productsData || []);
    } catch (error) {
      console.error(error);
      setMapLocProducts([]);
    } finally {
      setLoadingMapProducts(false);
    }
  };

  const handleOpenCreate = (prefills = {}) => {
    setEditingLocation(null);
    setWarehouse(prefills.warehouse || '');
    setAisle(prefills.aisle || '');
    setShelf(prefills.shelf || '');
    setLevel(prefills.level || '');
    if (prefills.warehouse && prefills.aisle && prefills.shelf && prefills.level) {
      const wPrefix = prefills.warehouse.substring(0, 3).toUpperCase();
      const aCode = prefills.aisle.toUpperCase();
      const sCode = String(prefills.shelf).padStart(2, '0');
      const lCode = String(prefills.level).padStart(2, '0');
      setLocationCode(`${wPrefix}-${aCode}-${sCode}-${lCode}`);
    } else {
      setLocationCode(prefills.locationCode || '');
    }
    setIsPisoVenta(prefills.isPisoVenta || false);
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocation(loc);
    setWarehouse(loc.warehouse || '');
    setAisle(loc.aisle || '');
    setShelf(loc.shelf || '');
    setLevel(loc.level || '');
    setLocationCode(loc.locationCode || '');
    setIsPisoVenta(loc.isPisoVenta || false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse.trim() || !locationCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Requerido',
        text: 'Almacén y Código de ubicación son obligatorios.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    if (isDuplicateCode) {
      Swal.fire({
        icon: 'error',
        title: 'Código Duplicado',
        text: 'Este código de ubicación ya está registrado. Por favor cambia el pasillo, estante o nivel para generar uno diferente.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    setSaving(true);
    try {
      const data = {
        warehouse: warehouse.trim(),
        aisle: aisle.trim() || null,
        shelf: shelf.trim() || null,
        level: level.trim() || null,
        locationCode: locationCode.trim(),
        isPisoVenta,
      };
      if (editingLocation) {
        await LocationService.update(editingLocation.id, data);
      } else {
        await LocationService.create(data);
      }
      setShowModal(false);
      await fetchLocations();
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      }).fire({
        icon: 'success',
        title: editingLocation ? 'Ubicación actualizada' : 'Ubicación creada',
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la ubicación.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: '¿Eliminar ubicación?',
      text: `¿Estás seguro de eliminar la ubicación "${code}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#10b981',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      try {
        await LocationService.delete(id);
        await fetchLocations();
        setSelectedMapLoc(null);
        Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        }).fire({
          icon: 'success',
          title: 'Ubicación eliminada',
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo eliminar la ubicación. Puede tener stock asociado.',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  };

  const filtered = useMemo(() => {
    return locations.filter(
      (loc) =>
        loc.locationCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.warehouse?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [locations, searchTerm]);

  


  return (
    <div className="space-y-6 animate-fade-in">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text)] tracking-tight flex items-center gap-2">
            <MapPin className="text-[var(--app-primary)] shrink-0" size={26} />
            Gestión de Ubicaciones
          </h1>
          <p className="text-[var(--app-text-muted)] text-sm font-medium">
            Define y gestiona las bodegas, estantes y zonas del inventario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-[var(--app-primary)] px-4 py-3 rounded-xl transition-all shadow-sm font-bold hover:scale-[1.02] cursor-pointer text-sm"
          >
            <BookOpen size={18} /> Guía de Ubicaciones
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 hover:to-[var(--app-primary)] text-white px-5 py-3 rounded-xl transition-all shadow-md font-bold hover:scale-[1.02] cursor-pointer text-sm"
          >
            <Plus size={18} /> Nueva Ubicación
          </button>
        </div>
      </div>

      {}
      <div className="flex bg-[var(--app-bg-subtle)] p-1 rounded-xl border border-[var(--app-border)] w-fit">
        <button
          onClick={() => {
            setActiveTab('MAP');
            setSelectedMapLoc(null);
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'MAP'
              ? 'bg-gradient-to-r from-[var(--app-primary)] to-blue-700 text-white shadow-md'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
        >
          <Layers size={13} />
          Esquema Visual (Mapa)
        </button>
        <button
          onClick={() => {
            setActiveTab('LIST');
            setSelectedMapLoc(null);
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'LIST'
              ? 'bg-gradient-to-r from-[var(--app-primary)] to-blue-700 text-white shadow-md'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
        >
          <Search size={13} />
          Lista Clásica
        </button>
      </div>

      {}
      {activeTab === 'MAP' ? (
        <div
          className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
            selectedMapLoc ? 'xl:grid-cols-[1fr_360px]' : ''
          }`}
        >
          <LocationsVisualMap
            locations={locations}
            selectedMapLoc={selectedMapLoc}
            onSelectLocation={handleSelectMapLocation}
            onAddLocation={handleOpenCreate}
          />

          {selectedMapLoc && (
            <LocationDetailsDrawer
              selectedMapLoc={selectedMapLoc}
              mapLocProducts={mapLocProducts}
              loadingMapProducts={loadingMapProducts}
              onClose={() => setSelectedMapLoc(null)}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      ) : (
        
        <LocationsTable
          locations={filtered}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {}
      {showModal && (
        <LocationFormModal
          editingLocation={editingLocation}
          warehouse={warehouse}
          setWarehouse={setWarehouse}
          locationCode={locationCode}
          setLocationCode={setLocationCode}
          aisle={aisle}
          setAisle={setAisle}
          shelf={shelf}
          setShelf={setShelf}
          level={level}
          setLevel={setLevel}
          isPisoVenta={isPisoVenta}
          setIsPisoVenta={setIsPisoVenta}
          isDuplicateCode={isDuplicateCode}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      <InventoryGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialStep={2}
      />
    </div>
  );
};

export default Locations;
