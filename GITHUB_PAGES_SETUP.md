# GitHub Pages Setup Instructions

## Проблема
GitHub Pages ищет папку `/docs` в корне репозитория, но она находилась в `ai-kids/docs`, что вызывало ошибку:
```
Error: No such file or directory @ dir_chdir0 - /github/workspace/docs
```

## Решение
1. Создана папка `docs` в корне репозитория
2. Добавлен файл `.nojekyll` для отключения обработки Jekyll
3. Создан скрипт `deploy-docs.cjs` для автоматического копирования build в docs

## Как обновить GitHub Pages

### Автоматический способ:
```bash
npm run build:docs
```
Этот скрипт:
1. Собирает проект (`npm run build` в ai-kids)
2. Копирует build в корневую папку `docs`
3. Создает файл `.nojekyll`

### Ручной способ:
1. Перейдите в папку `ai-kids` и соберите проект:
   ```bash
   cd ai-kids
   npm run build
   ```

2. Вернитесь в корень и запустите скрипт:
   ```bash
   cd ..
   node deploy-docs.cjs
   ```

3. Закоммитьте и отправьте изменения:
   ```bash
   git add docs
   git commit -m "Update GitHub Pages"
   git push origin main
   ```

## Настройки GitHub Pages

В настройках репозитория GitHub:
1. Перейдите в **Settings** → **Pages**
2. Убедитесь, что выбрано:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `docs`

## Важно

- Папка `docs` в корне репозитория должна быть закоммичена в Git
- Файл `.nojekyll` обязателен для React приложений (отключает Jekyll)
- После каждого обновления кода запускайте `npm run build:docs` и коммитьте изменения


