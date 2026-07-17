import { useState, useEffect } from 'react';
import { Package, Barcode, Tag, Building2, DollarSign, Percent, Loader2, Save, Bookmark } from 'lucide-react';
import {
  defaultPurchasePacksForForm,
  purchasePacksFromTemplate,
  resolvePackTemplateKey,
} from '../../utils/purchaseUnits';
import ProductService from '../../services/ProductService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatMoney } from '../../utils/formatMoney';
import Swal from 'sweetalert2';
import ProductLocationsSection from './ProductLocationsSection';
import ProductPurchasePacksSection from './ProductPurchasePacksSection';
import ResponsiveModal from '../ui/ResponsiveModal';
import FormSection from '../ui/FormSection';
import { PRODUCT_FIELD, PRODUCT_LABEL, PRODUCT_NUMBER_FIELD } from '../ui/formFieldStyles';

const ProductFormModal = ({
  isOpen,
  onClose,
  product,
  categories,
  suppliers,
  taxCategories,
  brands,
  onSuccess,
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
    minMarginPercent: '20',
    pricingPolicy: 'MANUAL',
    isActive: true,
    requiresBatch: false,
    requiresExpiration: false,
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
        minMarginPercent: product.minMarginPercent || '20',
        pricingPolicy: product.pricingPolicy || 'MANUAL',
        requiresBatch: !!product.requiresBatch,
        requiresExpiration: !!product.requiresExpiration,
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
        minMarginPercent: '20',
        pricingPolicy: 'MANUAL',
        isActive: true,
        requiresBatch: false,
        requiresExpiration: false,
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!/^[A-Za-z0-9-]+$/.test(formData.barcode)) {
      Swal.fire({
        icon: 'warning',
        title: 'Código inválido',
        text: 'El código de barras solo puede contener letras, números y guiones.',
      });
      return;
    }

    if (parseFloat(formData.salePrice) < parseFloat(formData.purchasePrice)) {
      Swal.fire({
        icon: 'warning',
        title: 'Margen inválido',
        text: 'El precio de venta no puede ser menor al costo de compra.',
      });
      return;
    }

    setSaving(true);

    const productPayload = {
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice),
      salePrice: parseFloat(formData.salePrice),
      currentStock: parseFloat(formData.currentStock),
      minimumStock: parseFloat(formData.minimumStock),
      categoryId: parseInt(formData.categoryId, 10),
      supplierId: parseInt(formData.supplierId, 10),
      taxCategoryId: parseInt(formData.taxCategoryId, 10),
      brandId: formData.brandId ? parseInt(formData.brandId, 10) : null,
      minStockExhibicion: parseFloat(formData.minStockExhibicion),
      minMarginPercent: parseFloat(formData.minMarginPercent),
      pricingPolicy: formData.pricingPolicy,
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
        Swal.fire({ icon: 'success', title: 'Producto actualizado', timer: 1800, showConfirmButton: false });
      } else {
        await ProductService.create(productPayload);
        Swal.fire({ icon: 'success', title: 'Producto creado', timer: 1800, showConfirmButton: false });
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
        text: validationText || getApiErrorMessage(error, 'Revisa los campos numéricos y el código de barras.'),
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentMargin = product?.currentMarginPercent ?? null;
  const averageCost = product?.averageCost ?? product?.purchasePrice ?? 0;
  const lastPurchaseCost = product?.lastPurchaseCost ?? product?.purchasePrice ?? 0;
  const packCount = purchasePacks.filter((p) => p.label?.trim()).length;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Package}
      title={product ? 'Modificar producto' : 'Nuevo producto'}
      subtitle="Código base, clasificación, precios y jerarquía de empaques"
      initialSize="xl"
      sizeOptions={['md', 'lg', 'xl', 'full']}
      bodyClassName="bg-[var(--app-bg-subtle)]/40 p-0"
      headerClassName="bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] text-white"
      footer={
        <div className="flex flex-col items-end gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <p className="text-right text-[11px] font-bold text-[var(--app-text-muted)]">
            {packCount} empaque{packCount === 1 ? '' : 's'} · margen mín. {formData.minMarginPercent || 0}%
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-soft)] transition-all hover:bg-[var(--app-bg-subtle)] sm:flex-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-7 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 sm:flex-none"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar
            </button>
          </div>
        </div>
      }
    >
      <form id="product-form" onSubmit={handleSave} className="flex h-full flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5">
          <FormSection
            title="1. Identidad del producto"
            description="Código de barras base (unidad mínima) y nombre comercial."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={PRODUCT_LABEL}>
                  <Barcode size={13} /> Código de barras <span className="text-[var(--app-danger)]">*</span>
                </label>
                <input
                  type="text"
                  name="barcode"
                  required
                  placeholder="Ej. 7401002233"
                  className={PRODUCT_FIELD}
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  Nombre comercial <span className="text-[var(--app-danger)]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej. Detergente Multiuso 1Kg"
                  className={PRODUCT_FIELD}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className={PRODUCT_LABEL}>Descripción</label>
              <input
                type="text"
                name="description"
                placeholder="Detalle opcional para catálogo e inventario"
                className={PRODUCT_FIELD}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          <FormSection
            title="2. Clasificación"
            description="Categoría, proveedor, marca e impuesto aplicable."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={PRODUCT_LABEL}>
                  <Tag size={13} /> Categoría <span className="text-[var(--app-danger)]">*</span>
                </label>
                <select name="categoryId" required className={`${PRODUCT_FIELD} cursor-pointer`} value={formData.categoryId} onChange={handleChange}>
                  <option value="" disabled={categories.length > 0}>
                    {categories.length ? 'Seleccione categoría' : 'Sin categorías'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  <Building2 size={13} /> Proveedor <span className="text-[var(--app-danger)]">*</span>
                </label>
                <select name="supplierId" required className={`${PRODUCT_FIELD} cursor-pointer`} value={formData.supplierId} onChange={handleChange}>
                  <option value="" disabled={suppliers.length > 0}>
                    {suppliers.length ? 'Seleccione proveedor' : 'Sin proveedores'}
                  </option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>{sup.companyName || sup.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  <Bookmark size={13} /> Marca
                </label>
                <select name="brandId" className={`${PRODUCT_FIELD} cursor-pointer`} value={formData.brandId} onChange={handleChange}>
                  <option value="">Sin marca / Genérico</option>
                  {brands?.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  <Percent size={13} /> Tipo de impuesto <span className="text-[var(--app-danger)]">*</span>
                </label>
                <select name="taxCategoryId" required className={`${PRODUCT_FIELD} cursor-pointer`} value={formData.taxCategoryId} onChange={handleChange}>
                  {taxCategories.map((tax) => (
                    <option key={tax.id} value={tax.id}>{tax.name} ({tax.rate}%)</option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection
            title="3. Precios y stock"
            description="Costo, venta, umbrales y política de precios."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={PRODUCT_LABEL}>
                  <DollarSign size={13} /> Costo / UN <span className="text-[var(--app-danger)]">*</span>
                </label>
                <input type="number" name="purchasePrice" required step="0.01" min="0.01" placeholder="C$ 0.00" className={PRODUCT_NUMBER_FIELD} value={formData.purchasePrice} onChange={handleChange} />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>
                  <DollarSign size={13} /> Precio venta / UN <span className="text-[var(--app-danger)]">*</span>
                </label>
                <input type="number" name="salePrice" required step="0.01" min="0.01" placeholder="C$ 0.00" className={PRODUCT_NUMBER_FIELD} value={formData.salePrice} onChange={handleChange} />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>Margen mínimo (%)</label>
                <input type="number" name="minMarginPercent" required min="0" step="0.01" className={PRODUCT_NUMBER_FIELD} value={formData.minMarginPercent} onChange={handleChange} />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>Stock inicial</label>
                <input type="number" name="currentStock" required min="0" className={PRODUCT_NUMBER_FIELD} value={formData.currentStock} onChange={handleChange} disabled={!!product} />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>Umbral mínimo bodega</label>
                <input type="number" name="minimumStock" required min="1" className={PRODUCT_NUMBER_FIELD} value={formData.minimumStock} onChange={handleChange} />
              </div>
              <div>
                <label className={PRODUCT_LABEL}>Mínimo en exhibición</label>
                <input type="number" name="minStockExhibicion" required min="0" className={PRODUCT_NUMBER_FIELD} value={formData.minStockExhibicion} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className={PRODUCT_LABEL}>Política de precio</label>
              <select name="pricingPolicy" className={`${PRODUCT_FIELD} cursor-pointer max-w-md`} value={formData.pricingPolicy} onChange={handleChange}>
                <option value="MANUAL">Manual</option>
                <option value="SUGGEST_ON_PURCHASE">Sugerir al comprar</option>
                <option value="AUTO_BY_MARGIN">Automático por margen</option>
              </select>
            </div>
            {product && (
              <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-subtle)] p-4 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Último costo</p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-[var(--app-text)]">{formatMoney(lastPurchaseCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Costo promedio</p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-[var(--app-text)]">{formatMoney(averageCost)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Margen actual</p>
                  <p className={`mt-1 text-sm font-bold tabular-nums ${currentMargin !== null && Number(currentMargin) < Number(formData.minMarginPercent || 0) ? 'text-[var(--app-warning)]' : 'text-[var(--app-success)]'}`}>
                    {currentMargin !== null ? `${Number(currentMargin).toFixed(2)}%` : 'Sin cálculo'}
                  </p>
                </div>
              </div>
            )}
          </FormSection>

          <FormSection
            title="4. Jerarquía de empaques (UOM)"
            description="UN → cajilla → caja → rejilla. Cada nivel con su factor y código de barras."
            bodyClassName="p-0"
          >
            <ProductPurchasePacksSection
              barcode={formData.barcode}
              productName={formData.name}
              purchasePacks={purchasePacks}
              setPurchasePacks={setPurchasePacks}
              packTemplateKey={packTemplateKey}
              applyPackTemplate={applyPackTemplate}
            />
          </FormSection>

          {product && (
            <FormSection title="5. Ubicaciones en bodega" description="Stock por ubicación física.">
              <ProductLocationsSection product={product} onStockChanged={onSuccess} />
            </FormSection>
          )}

          <FormSection title={product ? '6. Control operativo' : '5. Control operativo'}>
            <div className="space-y-3">
              {[
                { name: 'isActive', id: 'isActiveProduct', label: 'Habilitar para venta en caja' },
                { name: 'requiresBatch', id: 'requiresBatchProduct', label: 'Controlar por lote (PEPS al vender)' },
                { name: 'requiresExpiration', id: 'requiresExpirationProduct', label: 'Controlar por fecha de vencimiento' },
              ].map(({ name, id, label }) => (
                <label key={id} htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5">
                  <input
                    type="checkbox"
                    name={name}
                    id={id}
                    className="h-4 w-4 rounded border-[var(--app-border)] accent-[var(--app-primary)]"
                    checked={formData[name]}
                    onChange={handleChange}
                  />
                  <span className="text-xs font-semibold text-[var(--app-text)]">{label}</span>
                </label>
              ))}
            </div>
          </FormSection>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default ProductFormModal;
