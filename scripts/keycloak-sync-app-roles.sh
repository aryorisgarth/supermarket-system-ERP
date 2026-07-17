#!/usr/bin/env bash
# Respaldo manual: la API ya sincroniza roles al arrancar (KeycloakRoleSyncRunner).
# Usa este script solo si necesitas forzar la creacion sin reiniciar la API.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/keycloak-common.sh"

KEYCLOAK_CONTAINER="${KEYCLOAK_CONTAINER:-supermarket-keycloak}"
REALM="${KEYCLOAK_REALM:-supermarket}"

load_keycloak_env
assert_keycloak_container
wait_for_keycloak "http://127.0.0.1:8080/auth/realms/${REALM}"

echo "Syncing application realm roles in ${REALM} via ${KEYCLOAK_CONTAINER}..."
kcadm_credentials

docker exec -i \
  -e "KEYCLOAK_ADMIN=${KC_ADMIN_USER}" \
  -e "KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD}" \
  "${KEYCLOAK_CONTAINER}" \
  sh -ec '
    create_role() {
      name="$1"
      desc="$2"
      if /opt/keycloak/bin/kcadm.sh get "roles/${name}" -r "'"${REALM}"'" >/dev/null 2>&1; then
        echo "  OK  ${name} (ya existe)"
      else
        /opt/keycloak/bin/kcadm.sh create roles -r "'"${REALM}"'" -s name="${name}" -s description="${desc}"
        echo "  NEW ${name}"
      fi
    }

    create_role ADMIN_INGENIERO "Acceso tecnico total y gestion de backups"
    create_role ADMINISTRADOR "Acceso total a la gestion del negocio"
    create_role SUPERVISOR "Supervision de operaciones y arqueos de caja"
    create_role CAJERO "Operaciones de venta y cobro en caja"
    create_role CONSULTOR "Acceso de solo lectura para auditoria y reportes"
    create_role BODEGUERO "Recepcion de mercaderia, lotes y ordenamiento en bodega"

    echo ""
    echo "Realm roles actuales:"
    /opt/keycloak/bin/kcadm.sh get roles -r "'"${REALM}"'" --fields name
  '

echo "Done. Vuelve a crear/guardar el usuario en la app."
