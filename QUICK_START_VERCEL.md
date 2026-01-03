# ⚡ Быстрый старт - Vercel за 10 минут

## 1️⃣ GitHub (5 минут)

### Если нет Git:
```bash
# Установите Git: https://git-scm.com/download/win
```

### Загрузите код:
```bash
cd C:\Users\user\autovarka
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Затем:
1. Создайте репозиторий на [github.com/new](https://github.com/new)
2. Назовите: `autovarka`
3. Выполните:
```bash
git remote add origin https://github.com/ВАШ_USERNAME/autovarka.git
git push -u origin main
```

---

## 2️⃣ Vercel (5 минут)

1. **Регистрация:** [vercel.com](https://vercel.com) → Sign Up → GitHub
2. **Импорт:** New Project → Import `autovarka`
3. **Переменные окружения** (⚠️ ВАЖНО!):

```
SMTP_HOST = mail.autovarka.com.ua
SMTP_PORT = 465
SMTP_USER = info@autovarka.com.ua
SMTP_PASS = [ваш_пароль]
EMAIL_TO = info@autovarka.com.ua,skd7@ukr.net
TELEGRAM_BOT_TOKEN = [ваш_токен]
TELEGRAM_CHAT_ID = [ваш_chat_id]
```

4. **Deploy!** 🚀

---

## 3️⃣ Готово! ✅

Ваш сайт: `https://autovarka.vercel.app`

---

## 📌 Домен autovarka.ua

### В Vercel:
Settings → Domains → Add `autovarka.ua`

### В hostpro.ua (DNS):
```
A Record: @ → 76.76.21.21
A Record: www → 76.76.21.21
```

Готово через 10-30 минут! 🎉

---

## ⚠️ Важно знать

- ✅ Email уведомления работают
- ✅ Telegram уведомления работают
- ❌ Админка **НЕ сохраняет** изменения (файловая система read-only)
- ❌ Заказы **НЕ сохраняются** в JSON

**Решение:** Подключить базу данных (я помогу!)

---

## 🔄 Обновления

После изменения кода:
```bash
git add .
git commit -m "Описание изменений"
git push
```

Vercel автоматически развернет новую версию!

---

## 🆘 Проблемы?

Напишите мне - разберемся!

