@echo off
cd /d "%~dp0supermarket-system-api"
echo Iniciando API en http://localhost:8081 ...
mvn spring-boot:run
