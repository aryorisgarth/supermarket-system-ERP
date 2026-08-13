#!/usr/bin/env bash
# Crea usuarios demo en Keycloak (realm supermarket) para desarrollo local.
# La API los guarda en MySQL (DataSeeder); el login del frontend usa Keycloak direct grant.
#
# Uso:
#   bash scripts/keycloak-bootstrap.sh
#   bash scripts/keycloak-seed-demo-users.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/keycloak-common.sh"

REALM="${KEYCLOAK_REALM:-supermarket}"

load_keycloak_env
assert_keycloak_container
wait_for_keycloak "http://127.0.0.1:8080/auth/realms/${REALM}"
kcadm_credentials

kcadm() {
  docker exec -i \
    -e "KEYCLOAK_ADMIN=${KC_ADMIN_USER}" \
    -e "KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD}" \
    "${KEYCLOAK_CONTAINER}" \
    /opt/keycloak/bin/kcadm.sh "$@"
}

get_user_id() {
  local email="$1"
  kcadm get users -r "${REALM}" -q "username=${email}" --fields id --format csv --noquotes 2>/dev/null | tail -n1
}

upsert_demo_user() {
  local email="$1"
  local password="$2"
  local role="$3"
  local first="$4"
  local last="$5"
  local user_id

  user_id="$(get_user_id "${email}" || true)"
  if [[ -z "${user_id}" || "${user_id}" == "id" ]]; then
    echo ">> Creando usuario demo ${email}"
    kcadm create users -r "${REALM}" \
      -s "username=${email}" \
      -s "email=${email}" \
      -s "firstName=${first}" \
      -s "lastName=${last}" \
      -s enabled=true \
      -s emailVerified=true
    user_id="$(get_user_id "${email}")"
  else
    echo ">> Actualizando usuario demo ${email}"
  fi

  kcadm set-password -r "${REALM}" --username "${email}" --new-password "${password}" --temporary=false
  kcadm update "users/${user_id}" -r "${REALM}" -s 'requiredActions=[]'
  kcadm add-roles -r "${REALM}" --uusername "${email}" --rolename "${role}" 2>/dev/null || true

  echo "   OK  ${email} (${role})"
}

echo ">> Sincronizando usuarios demo en Keycloak realm=${REALM}"
upsert_demo_user "admin@supermarket.local" "Admin12345!" "ADMIN_INGENIERO" "Admin" "Ingeniero"
upsert_demo_user "administrador@supermarket.local" "Admin12345!" "ADMINISTRADOR" "Administrador" "Demo"
upsert_demo_user "supervisor@supermarket.local" "Supervisor12345!" "SUPERVISOR" "Supervisor" "Demo"
upsert_demo_user "consultor@supermarket.local" "Consultor12345!" "CONSULTOR" "Consultor" "Demo"
upsert_demo_user "cajero@supermarket.local" "Cajero12345!" "CAJERO" "Cajero" "Demo"
upsert_demo_user "bodeguero@supermarket.local" "Bodeguero12345!" "BODEGUERO" "Bodeguero" "Demo"

echo ""
echo "Listo. Prueba login en http://localhost/login"
echo "  admin@supermarket.local / Admin12345!"
