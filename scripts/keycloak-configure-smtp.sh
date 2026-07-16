#!/usr/bin/env bash
# Configura SMTP del realm + redirect del client para recovery de Keycloak.
set -euo pipefail

KEYCLOAK_CONTAINER="${KEYCLOAK_CONTAINER:-supermarket-keycloak}"
REALM="${KEYCLOAK_REALM:-supermarket}"
APP_CLIENT="${KEYCLOAK_CLIENT_ID:-supermarket-app}"
KC_SERVER="${KEYCLOAK_INTERNAL_URL:-http://127.0.0.1:8080/auth}"
FRONTEND_URL="${KEYCLOAK_FRONTEND_URL:-http://localhost/auth}"
REDIRECT_URI="${KEYCLOAK_REDIRECT_URI:-http://localhost/login}"

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

echo "Configuring Keycloak SMTP + client redirects..."
docker exec -e MAIL_USER="$SPRING_MAIL_USERNAME" -e MAIL_PASS="$SPRING_MAIL_PASSWORD" \
  -e REALM="$REALM" -e APP_CLIENT="$APP_CLIENT" -e FRONTEND_URL="$FRONTEND_URL" -e REDIRECT_URI="$REDIRECT_URI" \
  -e KC_SERVER="$KC_SERVER" \
  "${KEYCLOAK_CONTAINER}" bash -lc '
set -euo pipefail
/opt/keycloak/bin/kcadm.sh config credentials \
  --server "$KC_SERVER" \
  --realm master \
  --user "$KEYCLOAK_ADMIN" \
  --password "$KEYCLOAK_ADMIN_PASSWORD"

/opt/keycloak/bin/kcadm.sh update realms/$REALM \
  -s smtpServer.host=smtp.gmail.com \
  -s smtpServer.port=587 \
  -s "smtpServer.from=$MAIL_USER" \
  -s smtpServer.fromDisplayName=SuperNova \
  -s "smtpServer.replyTo=$MAIL_USER" \
  -s smtpServer.auth=true \
  -s smtpServer.starttls=true \
  -s smtpServer.ssl=false \
  -s "smtpServer.user=$MAIL_USER" \
  -s "smtpServer.password=$MAIL_PASS" \
  -s "attributes.frontendUrl=$FRONTEND_URL"

CID=$(/opt/keycloak/bin/kcadm.sh get clients -r "$REALM" -q clientId="$APP_CLIENT" --fields id --format csv --noquotes | tail -1)
if [ -n "$CID" ]; then
  /opt/keycloak/bin/kcadm.sh update clients/$CID -r "$REALM" \
    -s "redirectUris=[\"$REDIRECT_URI\",\"http://localhost/*\",\"http://127.0.0.1/*\",\"/*\"]" \
    -s "webOrigins=[\"+\"]" \
    -s "baseUrl=$REDIRECT_URI" || true
  echo "Client $APP_CLIENT updated ($CID)"
fi

echo "SMTP + redirects OK"
'

echo "Done."
