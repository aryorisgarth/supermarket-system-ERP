@echo off
echo ============================================
echo  Sincronizar MySQL local con el backend
echo ============================================
echo.
echo 1) Asegurate de que MySQL este encendido.
echo 2) Usuario/clave por defecto del proyecto: root / mysql
echo    (cambialos en application.yml si usas otros)
echo.
pause

set MYSQL_USER=root
set MYSQL_PASS=mysql
set MYSQL_HOST=localhost

echo.
echo Borrando base supermarket_system...
mysql -h %MYSQL_HOST% -u %MYSQL_USER% -p%MYSQL_PASS% -e "DROP DATABASE IF EXISTS supermarket_system; CREATE DATABASE supermarket_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if errorlevel 1 (
  echo.
  echo ERROR: No se pudo conectar a MySQL. Revisa usuario, clave o que el servicio este activo.
  echo Si tu clave no es "mysql", ejecuta manualmente: 01-DOCUMENTACION\reset-mysql-local.sql
  pause
  exit /b 1
)

echo.
echo Base vacia creada. Iniciando backend (Flyway creara tablas V1+V2+V3)...
cd /d "%~dp0supermarket-system-api"
call mvn spring-boot:run

pause
