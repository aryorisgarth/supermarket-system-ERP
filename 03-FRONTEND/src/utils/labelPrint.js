export function expandShelfLabelItems(products = []) {
  const items = [];

  for (const product of products) {
    const locations = product.locations || [];
    const floorLocations = locations.filter((loc) => loc.isPisoVenta);
    const targetLocations = floorLocations.length > 0 ? floorLocations : locations.slice(0, 1);

    if (targetLocations.length === 0) {
      items.push({ ...product, location: null });
      continue;
    }

    for (const location of targetLocations) {
      items.push({ ...product, location });
    }
  }

  return items;
}

export function expandProductLabelItems(products = [], copies = 1) {
  const safeCopies = Math.max(1, Math.min(Number(copies) || 1, 500));
  const items = [];

  for (const product of products) {
    for (let i = 0; i < safeCopies; i += 1) {
      items.push({ ...product, copyIndex: i + 1, totalCopies: safeCopies });
    }
  }

  return items;
}

export function formatUomLabel(uomBase) {
  const map = {
    UN: 'UNIDAD',
    KG: 'KILO',
    LB: 'LIBRA',
    LT: 'LITRO',
    ML: 'ML',
  };
  return map[String(uomBase || 'UN').toUpperCase()] || String(uomBase || 'UN').toUpperCase();
}

export function formatLocationLine(location) {
  if (!location) return 'SIN UBICACIÓN ASIGNADA';
  const parts = [location.locationCode];
  if (location.aisle) parts.push(`Pasillo ${location.aisle}`);
  if (location.shelf) parts.push(`Estante ${location.shelf}`);
  if (location.level) parts.push(`Nivel ${location.level}`);
  return parts.join(' · ');
}
