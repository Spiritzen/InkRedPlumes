@echo off
:: === Script de restauration de la base ink_red_plumes ===

:: Configuration de la connexion
set USER=root
set PASSWORD=root
set DATABASE=ink_red_plumes
set SQL_FILE=C:\Backup\backup_ink_red_plumes_20250617.sql

:: Vérifie si le fichier existe
IF NOT EXIST "%SQL_FILE%" (
    echo ❌ Le fichier SQL n'existe pas à l'emplacement : %SQL_FILE%
    pause
    exit /b
)

:: Exécution de la restauration
echo 🔁 Restauration de la base %DATABASE% depuis %SQL_FILE%
mysql -u %USER% -p%PASSWORD% < "%SQL_FILE%"

echo ✅ Restauration terminée !
pause
