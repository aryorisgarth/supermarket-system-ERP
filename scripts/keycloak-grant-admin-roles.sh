#!/usr/bin/env bash
# Otorga al client supermarket-admin-client los roles de Admin API
# necesarios para crear/sincronizar usuarios desde la API Spring.
#
# Uso (local o EC2, con el contenedor keycloak corriendo):
#   bash scripts/keycloak-grant-admin-roles.sh
#
set -euo pipefail

KEYCLOAK_CONTAINER="${KEYCLOAK_CONTAINER:-supermarket-keycloak}"
REALM="${KEYCLOAK_REALM:-supermarket}"
ADMIN_CLIENT_ID="${KEYCLOAK_ADMIN_CLIENT_ID:-supermarket-admin-client}"
SA_USER="service-account-${ADMIN_CLIENT_ID}"
KC_SERVER="${KEYCLOAK_INTERNAL_URL:-http://127.0.0.1:8080/auth}"

echo "Configuring Keycloak admin credentials inside ${KEYCLOAK_CONTAINER}..."
docker exec -i "${KEYCLOAK_CONTAINER}" bash -lc "
  /opt/keycloak/bin/kcadm.sh config credentials \
    --server '${KC_SERVER}' \
    --realm master \
    --user \"\${KEYCLOAK_ADMIN}\" \
    --password \"\${KEYCLOAK_ADMIN_PASSWORD}\"

  echo 'Granting realm-management roles to ${SA_USER}...'
  /opt/keycloak/bin/kcadm.sh add-roles -r '${REALM}' \
    --uusername '${SA_USER}' \
    --cclientid realm-management \
    --rolename manage-users \
    --rolename view-users \
    --rolename query-users \
    --rolename view-realm \
    --rolename manage-realm || true

  echo 'Current realm-management roles:'
  /opt/keycloak/bin/kcadm.sh get-roles -r '${REALM}' \
    --uusername '${SA_USER}' \
    --cclientid realm-management
"

echo "Done. Restart API if needed: docker compose restart api"
