@echo off
setlocal
echo Levantando los 3 servicios de MercAldas...
echo   backend        - http://localhost:3000
echo   Interfaz web   - http://localhost:5173
echo   Interfaz admin - http://localhost:8443
echo.

start "MercAldas Backend (3000)" cmd /k "cd /d ""%~dp0backend"" && yarn dev"
start "MercAldas Web (5173)" cmd /k "cd /d ""%~dp0Interfaz web"" && yarn dev"
start "MercAldas Admin (8443)" cmd /k "cd /d ""%~dp0Interfaz admin web"" && yarn dev"

echo Se abrieron 3 ventanas. Cierra cada ventana para detener su servicio.
endlocal
