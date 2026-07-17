#!/usr/bin/env bash
# Configura realm, clients y secretos de Keycloak para produccion.
# Corregir "unauthorized_client" / "Invalid client credentials" al guardar usuarios.
#
# Uso en EC2:
#   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d keycloak
#   bash scripts/keycloak-bootstrap.sh
#   docker compose -f docker-compose.prod.yml --env-file .env.prod restart api
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/keycloak-common.sh"

REALM="${KEYCLOAK_REALM:-supermarket}"
APP_CLIENT_ID="${KEYCLOAK_CLIENT_ID:-supermarket-app}"
ADMIN_CLIENT_ID="${KEYCLOAK_ADMIN_CLIENT_ID:-supermarket-admin-client}"

load_keycloak_env
ensure_admin_client_secret
assert_keycloak_container
wait_for_keycloak "http://127.0.0.1:8080/auth/realms/master"

ADMIN_CLIENT_SECRET="${KEYCLOAK_ADMIN_CLIENT_SECRET:-}"

echo ">> Bootstrap Keycloak realm=${REALM}"
kcadm_credentials

kcadm() {
  docker exec -i \
    -e "KEYCLOAK_ADMIN=${KC_ADMIN_USER}" \
    -e "KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD}" \
    "${KEYCLOAK_CONTAINER}" \
    /opt/keycloak/bin/kcadm.sh "$@"
}

if ! kcadm get "realms/${REALM}" >/dev/null 2>&1; then
  echo ">> Creando realm ${REALM}"
  kcadm create realms -s "realm=${REALM}" -s enabled=true
else
  echo ">> Realm ${REALM} ya existe"
fi

get_client_id() {
  local client_id="$1"
  kcadm get clients -r "${REALM}" -q "clientId=${client_id}" --fields id --format csv --noquotes 2>/dev/null | tail -n1
}

ensure_public_app_client() {
  local existing
  existing="$(get_client_id "${APP_CLIENT_ID}" || true)"
  if [[ -z "${existing}" || "${existing}" == "id" ]]; then
    echo ">> Creando client ${APP_CLIENT_ID}"
    kcadm create clients -r "${REALM}" \
      -s "clientId=${APP_CLIENT_ID}" \
      -s enabled=true \
      -s publicClient=true \
      -s directAccessGrantsEnabled=true \
      -s standardFlowEnabled=true \
      -s 'redirectUris=["*"]' \
      -s 'webOrigins=["*"]'
  else
    echo ">> Client ${APP_CLIENT_ID} ya existe (${existing})"
    kcadm update "clients/${existing}" -r "${REALM}" \
      -s publicClient=true \
      -s directAccessGrantsEnabled=true \
      -s standardFlowEnabled=true
  fi
}

ensure_admin_client() {
  local existing
  existing="$(get_client_id "${ADMIN_CLIENT_ID}" || true)"
  if [[ -z "${existing}" || "${existing}" == "id" ]]; then
    echo ">> Creando client ${ADMIN_CLIENT_ID}"
    kcadm create clients -r "${REALM}" \
      -s "clientId=${ADMIN_CLIENT_ID}" \
      -s enabled=true \
      -s publicClient=false \
      -s serviceAccountsEnabled=true \
      -s standardFlowEnabled=false \
      -s directAccessGrantsEnabled=false \
      -s "secret=${ADMIN_CLIENT_SECRET}"
  else
    echo ">> Actualizando secret de ${ADMIN_CLIENT_ID} (${existing})"
    kcadm update "clients/${existing}" -r "${REALM}" \
      -s "secret=${ADMIN_CLIENT_SECRET}" \
      -s serviceAccountsEnabled=true \
      -s publicClient=false \
      -s standardFlowEnabled=false \
      -s directAccessGrantsEnabled=false
  fi
}

ensure_public_app_client
ensure_admin_client

echo ">> Otorgando permisos realm-management a service-account-${ADMIN_CLIENT_ID}"
bash "${SCRIPT_DIR}/keycloak-grant-admin-roles.sh"

echo ">> Sincronizando roles de aplicacion"
bash "${SCRIPT_DIR}/keycloak-sync-app-roles.sh"

echo ""
echo "Listo. Reinicia la API:"
echo "  docker compose -f ${COMPOSE_FILE} --env-file .env.prod restart api"
