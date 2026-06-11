

export const PACK_DEFINITIONS = {
  UN: 'Unidad base de inventario y venta al detalle (1 pieza).',
  'M-CAJ': 'Media cajilla — bandeja pequeña (6 huevos). Solo venta al consumidor.',
  CAJILLA: 'Cajilla / bandeja completa. En huevos: 30 unidades (estándar Nicaragua).',
  CAJA: 'Caja de cartón del proveedor. Agrupa cajillas (ej. 2 cajillas de 30 = 60 huevos).',
  REJILLA: 'Rejilla plástica de transporte — la presentación MAYORISTA más grande. Trae varias cajillas (ej. 12×30 = 360 huevos).',
  SIX: 'Six pack — 6 unidades (latas o botellas).',
  PAQ: 'Paquete multipieza para venta o compra intermedia.',
  FARDO: 'Fardo — agrupación intermedia (ej. 12 bolsas).',
  SACO: 'Saco o bulto mayorista (ej. 50 unidades).',
};


export const EGG_HIERARCHY_HELP =
  'Huevos (de menor a mayor): 1 UN = 1 huevo → M-CAJ = 6 → CAJILLA = 30 → CAJA = 60 (2 cajillas en cartón) → REJILLA = 360 (12 cajillas en rejilla del proveedor). La rejilla es más grande que la caja; la caja trae cajillas, no media cajillas.';

export const PACK_TEMPLATES = {
  unitOnly: {
    id: 'unitOnly',
    name: 'Solo unidad',
    hint: 'Un producto = una unidad de inventario.',
    packs: [{ label: 'UN', factor: 1, isDefault: true, sortOrder: 0 }],
  },
  eggs: {
    id: 'eggs',
    name: 'Huevos',
    hint: EGG_HIERARCHY_HELP,
    packs: [
      { label: 'UN', factor: 1, isDefault: false, sortOrder: 0 },
      { label: 'M-CAJ', factor: 6, isDefault: false, sortOrder: 1 },
      { label: 'CAJILLA', factor: 30, isDefault: false, sortOrder: 2 },
      { label: 'CAJA', factor: 60, isDefault: false, sortOrder: 3 },
      { label: 'REJILLA', factor: 360, isDefault: true, sortOrder: 4 },
    ],
  },
  beverages: {
    id: 'beverages',
    name: 'Bebidas (lata/botella)',
    hint: 'UN → CAJILLA (6) → CAJA (24). La cajilla es el six-pack; la caja trae 4 cajillas.',
    packs: [
      { label: 'UN', factor: 1, isDefault: false, sortOrder: 0 },
      { label: 'CAJILLA', factor: 6, isDefault: false, sortOrder: 1 },
      { label: 'CAJA', factor: 24, isDefault: true, sortOrder: 2 },
    ],
  },
  dairy: {
    id: 'dairy',
    name: 'Lácteos empacados',
    hint: 'UN → PAQ (6) → CAJA (24). Ej. leche UHT, yogurt multipack.',
    packs: [
      { label: 'UN', factor: 1, isDefault: false, sortOrder: 0 },
      { label: 'PAQ', factor: 6, isDefault: false, sortOrder: 1 },
      { label: 'CAJA', factor: 24, isDefault: true, sortOrder: 2 },
    ],
  },
  dryGoods: {
    id: 'dryGoods',
    name: 'Despensa / granos',
    hint: 'UN (bolsa) → PAQ (6) → FARDO (12) → SACO (50). Inventario en unidades vendibles.',
    packs: [
      { label: 'UN', factor: 1, isDefault: false, sortOrder: 0 },
      { label: 'PAQ', factor: 6, isDefault: false, sortOrder: 1 },
      { label: 'FARDO', factor: 12, isDefault: false, sortOrder: 2 },
      { label: 'SACO', factor: 50, isDefault: true, sortOrder: 3 },
    ],
  },
  cleaning: {
    id: 'cleaning',
    name: 'Limpieza',
    hint: 'UN → PAQ (6) → CAJA (12).',
    packs: [
      { label: 'UN', factor: 1, isDefault: false, sortOrder: 0 },
      { label: 'PAQ', factor: 6, isDefault: false, sortOrder: 1 },
      { label: 'CAJA', factor: 12, isDefault: true, sortOrder: 2 },
    ],
  },
};


export const CATEGORY_TEMPLATE_MAP = {
  Bebidas: 'beverages',
  Lácteos: 'dairy',
  Lacteos: 'dairy',
  'Granos y Cereales': 'dryGoods',
  'Granos basicos': 'dryGoods',
  Despensa: 'dryGoods',
  General: 'dryGoods',
  Snacks: 'dryGoods',
  Panaderia: 'dryGoods',
  Congelados: 'dairy',
  Limpieza: 'cleaning',
  'Higiene Personal': 'cleaning',
  Carnes: 'unitOnly',
  Frutas: 'unitOnly',
  Verduras: 'unitOnly',
  Mascotas: 'dryGoods',
  Proeticos: 'unitOnly',
};

export const PACK_TEMPLATE_OPTIONS = Object.values(PACK_TEMPLATES).map((template) => ({
  id: template.id,
  name: template.name,
}));

const normalizeCategoryKey = (name = '') =>
  name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export function resolvePackTemplateKey(categoryName = '', productName = '') {
  const name = (productName || '').toLowerCase();
  if (name.includes('huevo')) {
    return 'eggs';
  }
  if (CATEGORY_TEMPLATE_MAP[categoryName]) {
    return CATEGORY_TEMPLATE_MAP[categoryName];
  }
  const normalized = normalizeCategoryKey(categoryName);
  const fuzzy = Object.entries(CATEGORY_TEMPLATE_MAP).find(
    ([key]) => normalizeCategoryKey(key) === normalized,
  );
  return fuzzy ? fuzzy[1] : 'unitOnly';
}

export function getPackTemplate(templateKey) {
  return PACK_TEMPLATES[templateKey] || PACK_TEMPLATES.unitOnly;
}

export function purchasePacksFromTemplate(templateKey) {
  return getPackTemplate(templateKey).packs.map((pack, index) => ({
    label: pack.label,
    factor: String(pack.factor),
    barcode: '',
    isDefault: Boolean(pack.isDefault),
    sortOrder: pack.sortOrder ?? index,
  }));
}

export function defaultPurchasePacksForForm(categoryName = '', productName = '') {
  const key = resolvePackTemplateKey(categoryName, productName);
  return purchasePacksFromTemplate(key);
}

export function sortPurchasePacks(packs) {
  return [...packs].sort(
    (a, b) => Number(a.factor || 0) - Number(b.factor || 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}


export function buildHierarchySummary(packs, unitLabel = 'uds. inventario') {
  const sorted = sortPurchasePacks(packs)
    .map((pack) => ({ ...pack, factor: Number(pack.factor) || 0 }))
    .filter((pack) => pack.factor > 0);
  if (sorted.length <= 1) {
    return null;
  }
  return sorted.map((pack) => `1 ${pack.label} = ${pack.factor} ${unitLabel}`).join('  →  ');
}

export const getDefaultPurchasePack = (product) => {
  const packs = product?.purchasePacks || [];
  return packs.find((pack) => pack.isDefault) || packs[0] || { id: null, label: 'UN', factor: 1 };
};

export const suggestCostPerPack = (product, pack) => {
  const unitCost = Number(product?.purchasePrice || 0);
  const factor = Number(pack?.factor || 1);
  return unitCost * factor;
};

export const computeBaseUnits = (quantityInPacks, factor) =>
  Number(quantityInPacks || 0) * Number(factor || 1);

export const computeLineTotal = (quantityInPacks, costPerPack) =>
  Number(quantityInPacks || 0) * Number(costPerPack || 0);

export const formatPackSummary = (quantityInPacks, packLabel, factor) => {
  const base = computeBaseUnits(quantityInPacks, factor);
  return `${quantityInPacks || 0} ${packLabel || 'UN'} × ${factor || 1} = ${base} uds. inventario`;
};
