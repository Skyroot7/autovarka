@echo off
echo ========================================
echo Загрузка кода на GitHub
echo ========================================
echo.

cd /d C:\Users\user\autovarka

echo [1/5] Инициализация Git...
git init
if errorlevel 1 (
    echo ОШИБКА: Git не установлен!
    echo Пожалуйста, установите Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [2/5] Добавление файлов...
git add .

echo [3/5] Создание коммита...
git commit -m "Initial commit"

echo [4/5] Добавление удаленного репозитория...
git remote add origin https://github.com/Skyroot7/autovarka.git

echo [5/5] Загрузка на GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo ГОТОВО! Код загружен на GitHub!
echo ========================================
pause

