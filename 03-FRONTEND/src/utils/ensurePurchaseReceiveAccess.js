import AuthService from '../services/AuthService';
import PurchaseOrderService from '../services/PurchaseOrderService';

/**
 * Garantiza acceso a la recepción física:
 * - Si nadie la tomó → claim automático
 * - Si es mía → ok
 * - Si es de otro → solo con PURCHASE_MANAGE (supervisor/admin)
 */
export async function ensurePurchaseReceiveAccess(order) {
  if (!order?.id) {
    throw new Error('Orden de compra no válida.');
  }

  const currentUser = AuthService.getCurrentUser();
  const canOverride = AuthService.hasPermission('PURCHASE_MANAGE');

  if (order.receivedBy) {
    const isMine = currentUser?.id != null && String(order.receivedBy.id) === String(currentUser.id);
    if (!isMine && !canOverride) {
      const name =
        order.receivedBy.fullName ||
        order.receivedBy.name ||
        order.receivedBy.email ||
        'otro usuario';
      const error = new Error(`Esta recepción la está procesando ${name}.`);
      error.code = 'CLAIMED_BY_OTHER';
      throw error;
    }
    return order;
  }

  return PurchaseOrderService.claim(order.id);
}
