import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, MapPin, Layers, Search } from 'lucide-react';
import Swal from 'sweetalert2';

import LocationService from '../services/LocationService';

import LocationsVisualMap from '../components/locations/LocationsVisualMap';
import LocationDetailsDrawer from '../components/locations/LocationDetailsDrawer';
import LocationsTable from '../components/locations/LocationsTable';
import LocationFormModal from '../components/locations/LocationFormModal';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [saving, setSaving] = useState(false);

  // Navigation tabs: 'MAP' (visual map) or 'LIST' (classic table)
  const [activeTab, setActiveTab] = useState('MAP');

  // Details drawer for selected location on visual map
  const [selectedMapLoc, setSelectedMapLoc] = useState(null);
  const [mapLocProducts, setMapLocProducts] = useState([]);
  const [loadingMapProducts, setLoadingMapProducts] = useState(false);

  const [warehouse, setWarehouse] = useState('');
  const [aisle, setAisle] = useState('');
  const [shelf, setShelf] = useState('');
  const [level, setLevel] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [isPisoVenta, setIsPisoVenta] = useState(false);

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

  // Fetch products inside a clicked location
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

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setWarehouse('');
    setAisle('');
    setShelf('');
    setLevel('');
    setLocationCode('');
    setIsPisoVenta(false);
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

  // Group warehouse locations (isPisoVenta = false) by Aisle for visual racks mapping
  const warehouseRacks = useMemo(() => {
    const whLocs = locations.filter((loc) => !loc.isPisoVenta);
    const groups = {};
    whLocs.forEach((loc) => {
      const aisleName = loc.aisle || 'General';
      if (!groups[aisleName]) groups[aisleName] = [];
      groups[aisleName].push(loc);
    });

    // Sort locations within each aisle by Level desc and Shelf asc
    Object.keys(groups).forEach((aisleName) => {
      groups[aisleName].sort((a, b) => {
        const levelA = parseInt(a.level) || 0;
        const levelB = parseInt(b.level) || 0;
        if (levelB !== levelA) return levelB - levelA; // Nivel de arriba a abajo

        const shelfA = parseInt(a.shelf) || 0;
        const shelfB = parseInt(b.shelf) || 0;
        return shelfA - shelfB; // Estante de izquierda a derecha
      });
    });
    return groups;
  }, [locations]);

  // Store floor locations (isPisoVenta = true)
  const storeShelves = useMemo(() => {
    return locations.filter((loc) => loc.isPisoVenta);
  }, [locations]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--app-text)] tracking-tight flex items-center gap-2">
            <MapPin className="text-[var(--app-primary)] shrink-0" size={26} />
            Gestión de Ubicaciones
          </h1>
          <p className="text-[var(--app-text-muted)] text-sm font-medium">
            Define y gestiona las bodegas, estantes y zonas del inventario.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--app-primary)] to-blue-700 hover:to-[var(--app-primary)] text-white px-5 py-3 rounded-xl transition-all shadow-md font-bold hover:scale-[1.02] cursor-pointer text-sm"
        >
          <Plus size={18} /> Nueva Ubicación
        </button>
      </div>

      {/* Tabs Selection */}
      <div className="flex bg-[var(--app-bg-subtle)] p-1 rounded-xl border border-[var(--app-border)] w-fit">
        <button
          onClick={() => {
            setActiveTab('MAP');
            setSelectedMapLoc(null);
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'MAP'
              ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
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
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'LIST'
              ? 'bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm border border-[var(--app-border)]'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
        >
          <Search size={13} />
          Lista Clásica
        </button>
      </div>

      {/* Main visual map / table split */}
      {activeTab === 'MAP' ? (
        <div
          className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
            selectedMapLoc ? 'xl:grid-cols-[1fr_360px]' : ''
          }`}
        >
          <LocationsVisualMap
            warehouseRacks={warehouseRacks}
            storeShelves={storeShelves}
            selectedMapLoc={selectedMapLoc}
            onSelectLocation={handleSelectMapLocation}
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
        /* Classic List View */
        <LocationsTable
          locations={filtered}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Save / Edit Modal */}
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
          saving={saving}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Locations;
