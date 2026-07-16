#!/usr/bin/env bash
# Configura SMTP del realm Keycloak escribiendo un JSON DENTRO del contenedor.
set -euo pipefail

KEYCLOAK_CONTAINER="${KEYCLOAK_CONTAINER:-supermarket-keycloak}"
REALM="${KEYCLOAK_REALM:-supermarket}"
KC_SERVER="${KEYCLOAK_INTERNAL_URL:-http://127.0.0.1:8080/auth}"
FRONTEND_URL="${KEYCLOAK_FRONTEND_URL:-http://localhost/auth}"

if [ -z "${SPRING_MAIL_USERNAME:-}" ] || [ -z "${SPRING_MAIL_PASSWORD:-}" ]; then
  if [ -f .env ]; then
    SPRING_MAIL_USERNAME="$(grep -E '^SPRING_MAIL_USERNAME=' .env | head -1 | cut -d= -f2- | tr -d '\r')"
    SPRING_MAIL_PASSWORD="$(grep -E '^SPRING_MAIL_PASSWORD=' .env | head -1 | cut -d= -f2- | tr -d '\r')"
  fi
fi

if [ -z "${SPRING_MAIL_USERNAME:-}" ] || [ -z "${SPRING_MAIL_PASSWORD:-}" ]; then
  echo "Faltan SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD"
  exit 1
fi

echo "Writing SMTP config inside ${KEYCLOAK_CONTAINER}..."
docker exec -e U="$SPRING_MAIL_USERNAME" -e P="$SPRING_MAIL_PASSWORD" -e F="$FRONTEND_URL" \
  -e REALM="$REALM" -e KC_SERVER="$KC_SERVER" \
  "${KEYCLOAK_CONTAINER}" bash -lc '
set -euo pipefail
/opt/keycloak/bin/kcadm.sh config credentials --server "$KC_SERVER" --realm master \
  --user "$KEYCLOAK_ADMIN" --password "$KEYCLOAK_ADMIN_PASSWORD" >/dev/null

# Keycloak 24: set each smtpServer.* field explicitly
/opt/keycloak/bin/kcadm.sh update realms/$REALM \
  -s smtpServer.host=smtp.gmail.com \
  -s smtpServer.port=587 \
  -s smtpServer.from="$U" \
  -s smtpServer.fromDisplayName=SuperNova \
  -s smtpServer.replyTo="$U" \
  -s smtpServer.auth=true \
  -s smtpServer.starttls=true \
  -s smtpServer.ssl=false \
  -s smtpServer.user="$U" \
  -s smtpServer.password="$P"

# Frontend URL for links in emails
/opt/keycloak/bin/kcadm.sh update realms/$REALM -s "attributes.frontendUrl=$F" || true

HOST=$(/opt/keycloak/bin/kcadm.sh get realms/$REALM --fields smtpServer 2>/dev/null | grep -c smtp.gmail.com || true)
echo "smtp_gmail_configured=$HOST"
/opt/keycloak/bin/kcadm.sh get realms/$REALM --fields smtpServer 2>/dev/null | sed "s/\"password\"[^,}]*/\"password\":\"***\"/g"
'

echo "Done."
