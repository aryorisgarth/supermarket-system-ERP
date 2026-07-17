#!/usr/bin/env bash
# Otorga al client supermarket-admin-client los roles de Admin API
# necesarios para crear/sincronizar usuarios desde la API Spring.
#
# Uso en EC2:
#   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d keycloak
#   bash scripts/keycloak-grant-admin-roles.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/keycloak-common.sh"

KEYCLOAK_CONTAINER="${KEYCLOAK_CONTAINER:-supermarket-keycloak}"
REALM="${KEYCLOAK_REALM:-supermarket}"
ADMIN_CLIENT_ID="${KEYCLOAK_ADMIN_CLIENT_ID:-supermarket-admin-client}"
SA_USER="service-account-${ADMIN_CLIENT_ID}"

load_keycloak_env
assert_keycloak_container
wait_for_keycloak "http://127.0.0.1:8080/auth/realms/master"

echo "Configuring Keycloak admin credentials inside ${KEYCLOAK_CONTAINER}..."
kcadm_credentials

echo "Granting realm-management roles to ${SA_USER}..."
docker exec -i \
  -e "KEYCLOAK_ADMIN=${KC_ADMIN_USER}" \
  -e "KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD}" \
  "${KEYCLOAK_CONTAINER}" \
  /opt/keycloak/bin/kcadm.sh add-roles -r "${REALM}" \
    --uusername "${SA_USER}" \
    --cclientid realm-management \
    --rolename manage-users \
    --rolename view-users \
    --rolename query-users \
    --rolename view-realm \
    --rolename manage-realm || true

echo "Current realm-management roles:"
docker exec -i \
  -e "KEYCLOAK_ADMIN=${KC_ADMIN_USER}" \
  -e "KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD}" \
  "${KEYCLOAK_CONTAINER}" \
  /opt/keycloak/bin/kcadm.sh get-roles -r "${REALM}" \
    --uusername "${SA_USER}" \
    --cclientid realm-management

echo "Done. Reinicia la API: docker compose -f ${COMPOSE_FILE} --env-file .env.prod restart api"
