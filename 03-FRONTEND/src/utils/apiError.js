
const API_ERROR_TRANSLATIONS = {
  'Product cannot be deleted because it has associated batches':
    'No se puede eliminar el producto porque tiene lotes en bodega. Desactívelo en inventario en lugar de borrarlo.',
  'Product cannot be deleted because it has associated sales':
    'No se puede eliminar el producto porque ya tiene ventas registradas.',
  'Product cannot be deleted due to related data in database':
    'No se puede eliminar el producto porque está vinculado a otros registros del sistema.',
  'Product barcode already exists':
    'Ya existe otro producto con ese código de barras.',
  'No se pudo actualizar las presentaciones del producto porque hay movimientos de inventario vinculados.':
    'No se pudo guardar porque hay movimientos de inventario vinculados a las presentaciones del producto.',
};

export function getApiErrorMessage(error, fallback = 'Ocurrió un error inesperado.') {
  const raw = typeof error === 'string' && error.trim()
    ? error
    : error?.response?.data?.message || error?.message || fallback;
  return API_ERROR_TRANSLATIONS[raw] || raw || fallback;
}
