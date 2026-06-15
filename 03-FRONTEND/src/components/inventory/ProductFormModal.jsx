import React, { useState, useEffect } from 'react';
import { X, Package, Barcode, Tag, Building2, DollarSign, Percent, Loader2, Save, Bookmark } from 'lucide-react';
import {
  defaultPurchasePacksForForm,
  purchasePacksFromTemplate,
  resolvePackTemplateKey,
} from '../../utils/purchaseUnits';
import ProductService from '../../services/ProductService';
import { getApiErrorMessage } from '../../utils/apiError';
import Swal from 'sweetalert2';
import ProductLocationsSection from './ProductLocationsSection';
import ProductPurchasePacksSection from './ProductPurchasePacksSection';

const ProductFormModal = ({
  isOpen,
  onClose,
  product,
  categories,
  suppliers,
  taxCategories,
  brands,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    purchasePrice: '',
    salePrice: '',
    currentStock: '0',
    minimumStock: '5',
    categoryId: '',
    supplierId: '',
    taxCategoryId: '',
    brandId: '',
    minStockExhibicion: '5',
    isActive: true,
    requiresBatch: false,
    requiresExpiration: false
  });
  const [purchasePacks, setPurchasePacks] = useState(defaultPurchasePacksForForm());
  const [packTemplateKey, setPackTemplateKey] = useState('unitOnly');
  const [saving, setSaving] = useState(false);

  const resolveCategoryName = (categoryId) =>
    categories.find((cat) => String(cat.id) === String(categoryId))?.name || '';

  const applyPackTemplate = (templateKey) => {
    setPackTemplateKey(templateKey);
    setPurchasePacks(purchasePacksFromTemplate(templateKey));
  };

  useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        purchasePrice: product.purchasePrice || '',
        salePrice: product.salePrice || '',
        currentStock: product.currentStock || '0',
        minimumStock: product.minimumStock || '5',
        categoryId: product.category?.id || categories[0]?.id || '',
        supplierId: product.supplierId || product.supplier?.id || suppliers[0]?.id || '',
        taxCategoryId: product.taxCategoryId || product.taxCategory?.id || taxCategories[0]?.id || '',
        isActive: product.isActive !== false,
        brandId: product.brand?.id || '',
        minStockExhibicion: product.minStockExhibicion || '5',
        requiresBatch: !!product.requiresBatch,
        requiresExpiration: !!product.requiresExpiration
      });
      const categoryName = product.category?.name || resolveCategoryName(product.category?.id);
      const templateKey = resolvePackTemplateKey(categoryName, product.name);
      setPackTemplateKey(templateKey);
      
      const conversionsMap = {};
      if (product.uomConversions) {
        product.uomConversions.forEach((conv) => {
          if (conv.label) {
            conversionsMap[conv.label.toUpperCase()] = conv.barcode;
          }
        });
      }

      setPurchasePacks(
        product.purchasePacks?.length
          ? product.purchasePacks.map((pack, index) => {
            const upperLabel = pack.label?.toUpperCase();
            return {
              label: pack.label,
              factor: String(pack.factor),
              barcode: conversionsMap[upperLabel] || pack.barcode || '',
              isDefault: Boolean(pack.isDefault),
              sortOrder: pack.sortOrder ?? index,
            };
          })
          : defaultPurchasePacksForForm(categoryName, product.name)
      );
    } else {
      const categoryName = resolveCategoryName(categories[0]?.id);
      const templateKey = resolvePackTemplateKey(categoryName, '');
      setPackTemplateKey(templateKey);
      setFormData({
        barcode: '',
        name: '',
        description: '',
        purchasePrice: '',
        salePrice: '',
        currentStock: '0',
        minimumStock: '5',
        categoryId: categories[0]?.id || '',
        supplierId: suppliers[0]?.id || '',
        taxCategoryId: taxCategories[0]?.id || '',
        brandId: '',
        minStockExhibicion: '5',
        isActive: true,
        requiresBatch: false,
        requiresExpiration: false
      });
      setPurchasePacks(defaultPurchasePacksForForm(categoryName, ''));
    }
  }, [product, isOpen, categories, suppliers, taxCategories]);

  useEffect(() => {
    if (product || !isOpen) return;
    const categoryName = resolveCategoryName(formData.categoryId);
    const templateKey = resolvePackTemplateKey(categoryName, formData.name);
    setPackTemplateKey(templateKey);
    setPurchasePacks(defaultPurchasePacksForForm(categoryName, formData.name));
  }, [formData.categoryId, formData.name, product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const productPayload = {
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice),
      salePrice: parseFloat(formData.salePrice),
      currentStock: parseFloat(formData.currentStock),
      minimumStock: parseFloat(formData.minimumStock),
      categoryId: parseInt(formData.categoryId),
      supplierId: parseInt(formData.supplierId),
      taxCategoryId: parseInt(formData.taxCategoryId),
      brandId: formData.brandId ? parseInt(formData.brandId) : null,
      minStockExhibicion: parseFloat(formData.minStockExhibicion),
      requiresBatch: Boolean(formData.requiresBatch),
      requiresExpiration: Boolean(formData.requiresExpiration),
      purchasePacks: purchasePacks
        .filter((pack) => pack.label?.trim() && Number(pack.factor) > 0)
        .map((pack, index) => ({
          label: pack.label.trim().toUpperCase(),
          factor: parseFloat(pack.factor),
          barcode: pack.barcode?.trim() || null,
          isDefault: Boolean(pack.isDefault),
          sortOrder: index,
        })),
    };

    try {
      if (product) {
        await ProductService.update(product.id, productPayload);
        Swal.fire({
          icon: 'success',
          title: 'Producto Actualizado',
          text: 'Los cambios se han guardado con éxito.',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await ProductService.create(productPayload);
        Swal.fire({
          icon: 'success',
          title: 'Producto Creado',
          text: 'El nuevo producto fue añadido al catálogo.',
          timer: 1800,
          showConfirmButton: false
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      const validation = error?.response?.data?.validationErrors;
      const validationText = validation
        ? Object.entries(validation).map(([field, msg]) => `${field}: ${msg}`).join('\n')
        : '';
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: validationText || getApiErrorMessage(error, 'Revisa que los campos numéricos y el código de barras sean correctos.'),
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] max-w-xl w-full overflow-hidden my-8">
        
        <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {product ? 'Modificar Ficha de Producto' : 'Crear Producto en Catálogo'}
              </h3>
              <p className="text-white/80 text-[10px] font-medium mt-0.5">
                Define códigos de barra fiscales, precios y proveedores en SuperNova.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        
        <form onSubmit={handleSave}>
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto bg-[var(--app-surface)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Barcode size={13} /> Código de Barras
                </label>
                <input
                  type="text"
                  name="barcode"
                  required
                  placeholder="Ej. 7401002233"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>

              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Nombre Comercial</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej. Detergente Multiuso 1Kg"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Detalles / Descripción</label>
              <input
                type="text"
                name="description"
                placeholder="Ej. Detergente en polvo biodegradable con fragancia a limón"
                className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Tag size={13} /> Categoría
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs cursor-pointer shadow-sm"
                  value={formData.categoryId}
                  onChange={handleChange}
                >
                  <option value="" disabled={categories.length > 0}>
                    {categories.length ? 'Seleccione categoría' : 'Sin categorías disponibles'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Building2 size={13} /> Proveedor
                </label>
                <select
                  name="supplierId"
                  required
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs cursor-pointer shadow-sm"
                  value={formData.supplierId}
                  onChange={handleChange}
                >
                  <option value="" disabled={suppliers.length > 0}>
                    {suppliers.length ? 'Seleccione proveedor' : 'Sin proveedores disponibles'}
                  </option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.companyName || sup.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Bookmark size={13} /> Marca
                </label>
                <select
                  name="brandId"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs cursor-pointer shadow-sm"
                  value={formData.brandId}
                  onChange={handleChange}
                >
                  <option value="">Sin marca / Genérico</option>
                  {brands && brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Mínimo en Exhibición</label>
                <input
                  type="number"
                  name="minStockExhibicion"
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                  value={formData.minStockExhibicion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={13} /> Costo / unidad venta
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                />
              </div>

              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={13} /> Precio Venta
                </label>
                <input
                  type="number"
                  name="salePrice"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                  value={formData.salePrice}
                  onChange={handleChange}
                />
              </div>

              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Percent size={13} /> Tipo Impuesto
                </label>
                <select
                  name="taxCategoryId"
                  required
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs cursor-pointer shadow-sm"
                  value={formData.taxCategoryId}
                  onChange={handleChange}
                >
                  {taxCategories.map(tax => (
                    <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Stock Inicial</label>
                <input
                  type="number"
                  name="currentStock"
                  required
                  min="0"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm disabled:opacity-50 disabled:bg-[var(--app-bg-subtle)]"
                  value={formData.currentStock}
                  onChange={handleChange}
                  disabled={!!product}
                />
              </div>

              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Umbral Mínimo</label>
                <input
                  type="number"
                  name="minimumStock"
                  required
                  min="1"
                  className="w-full px-3 py-2 bg-[var(--app-bg-subtle)]/50 border border-[var(--app-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-[var(--app-surface)] transition-all font-bold text-[var(--app-text)] text-xs shadow-sm"
                  value={formData.minimumStock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <ProductPurchasePacksSection
              barcode={formData.barcode}
              productName={formData.name}
              purchasePacks={purchasePacks}
              setPurchasePacks={setPurchasePacks}
              packTemplateKey={packTemplateKey}
              applyPackTemplate={applyPackTemplate}
            />

            
            {product && (
              <ProductLocationsSection 
                product={product} 
                onStockChanged={onSuccess} 
              />
            )}

            <div className="space-y-3 pt-3 border-t border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActiveProduct"
                  className="h-4.5 w-4.5 rounded text-primary border-[var(--app-border-strong)] focus:ring-primary/20 cursor-pointer"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <label htmlFor="isActiveProduct" className="text-xs font-bold text-[var(--app-text-soft)] cursor-pointer select-none">
                  Habilitar producto para comercialización y facturación en caja
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="requiresBatch"
                  id="requiresBatchProduct"
                  className="h-4.5 w-4.5 rounded text-primary border-[var(--app-border-strong)] focus:ring-primary/20 cursor-pointer"
                  checked={formData.requiresBatch}
                  onChange={handleChange}
                />
                <label htmlFor="requiresBatchProduct" className="text-xs font-bold text-[var(--app-text-soft)] cursor-pointer select-none">
                  Controlar por Lote (descontará de lotes activos al vender)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="requiresExpiration"
                  id="requiresExpirationProduct"
                  className="h-4.5 w-4.5 rounded text-primary border-[var(--app-border-strong)] focus:ring-primary/20 cursor-pointer"
                  checked={formData.requiresExpiration}
                  onChange={handleChange}
                />
                <label htmlFor="requiresExpirationProduct" className="text-xs font-bold text-[var(--app-text-soft)] cursor-pointer select-none">
                  Controlar por Fecha de Vencimiento (requiere fecha al recibir en bodega)
                </label>
              </div>
            </div>
          </div>

          
          <div className="p-5 bg-[var(--app-bg-subtle)]/50 border-t border-[var(--app-border)] flex justify-end gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[var(--app-surface)] hover:bg-[var(--app-bg-subtle)] border border-[var(--app-border)] hover:border-[var(--app-border-strong)] text-[var(--app-text-soft)] font-bold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-7 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all hover:scale-[1.02] duration-200 flex items-center gap-1.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin animate-duration-1000" />
              ) : (
                <Save size={14} />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
