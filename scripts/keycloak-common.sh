#!/usr/bin/env bash
# Utilidades compartidas para scripts de Keycloak (local / EC2).
set -euo pipefail

KEYCLOAK_CONTAINER="${KEYCLOAK_CONTAINER:-supermarket-keycloak}"
REALM="${KEYCLOAK_REALM:-supermarket}"
KC_SERVER="${KEYCLOAK_INTERNAL_URL:-http://127.0.0.1:8080/auth}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-}"

KC_ADMIN_USER="${KC_ADMIN_USER:-admin}"
KC_ADMIN_PASSWORD="${KC_ADMIN_PASSWORD:-}"

load_keycloak_env() {
  local env_file="${ENV_FILE}"
  if [[ -z "${env_file}" ]]; then
    if [[ -f .env.prod ]]; then
      env_file=".env.prod"
    elif [[ -f .env ]]; then
      env_file=".env"
    fi
  fi

  if [[ -n "${env_file}" && -f "${env_file}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${env_file}"
    set +a
    echo ">> Variables cargadas desde ${env_file}"
  fi

  KC_ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
  KC_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-}"

  if [[ -z "${KC_ADMIN_PASSWORD}" ]]; then
    echo "ERROR: KEYCLOAK_ADMIN_PASSWORD no esta definida."
    echo "Crea o revisa .env.prod y vuelve a levantar compose con --env-file .env.prod"
    exit 1
  fi
}

assert_keycloak_container() {
  if ! docker ps --format '{{.Names}}' | grep -qx "${KEYCLOAK_CONTAINER}"; then
    echo "ERROR: el contenedor '${KEYCLOAK_CONTAINER}' no esta corriendo."
    echo ""
    echo "Levanta Keycloak:"
    echo "  docker compose -f ${COMPOSE_FILE} --env-file .env.prod up -d keycloak"
    echo ""
    docker ps -a --filter "name=${KEYCLOAK_CONTAINER}" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true
    exit 1
  fi
}

wait_for_keycloak() {
  local url="${1:-http://127.0.0.1:8080/auth/realms/master}"
  echo ">> Esperando Keycloak en ${url} ..."

  local i
  for i in $(seq 1 60); do
    if docker run --rm --network "container:${KEYCLOAK_CONTAINER}" \
      curlimages/curl:8.5.0 -sf "${url}" >/dev/null 2>&1; then
      echo ">> Keycloak respondio (intento ${i}/60)."
      return 0
    fi

    if (( i % 5 == 0 )); then
      echo "   ... aun iniciando (${i}/60)"
    fi
    sleep 3
  done

  echo "ERROR: Keycloak no respondio en ~3 minutos."
  echo ""
  echo "Ultimas lineas del log:"
  docker logs "${KEYCLOAK_CONTAINER}" --tail 80 || true
  echo ""
  echo "Sugerencias en EC2:"
  echo "  free -h    # Keycloak necesita RAM libre (~512MB minimo)"
  echo "  docker compose -f ${COMPOSE_FILE} --env-file .env.prod restart keycloak"
  exit 1
}

kcadm_credentials() {
  docker exec -i \
    -e "KEYCLOAK_ADMIN=${KC_ADMIN_USER}" \
    -e "KEYCLOAK_ADMIN_PASSWORD=${KC_ADMIN_PASSWORD}" \
    "${KEYCLOAK_CONTAINER}" \
    /opt/keycloak/bin/kcadm.sh config credentials \
      --server "${KC_SERVER}" \
      --realm master \
      --user "${KC_ADMIN_USER}" \
      --password "${KC_ADMIN_PASSWORD}"
}
