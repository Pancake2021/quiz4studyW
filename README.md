# 🎓 Тренажёр — Telegram Mini App

Интерактивный тренажёр для подготовки к техническим собеседованиям.
Работает как **GitHub Pages** сайт и как **Telegram Mini App**.

## 🌐 Деплой на GitHub Pages

1. Залей репозиторий на GitHub
2. Перейди в **Settings → Pages**
3. Выбери ветку `main`, папку `/` (root)
4. Сайт будет доступен по адресу: `https://<username>.github.io/<repo>/`

## 📱 Telegram Mini App

В BotFather:
1. `/newapp` → выбери своего бота
2. Web App URL: `https://<username>.github.io/<repo>/`

---

## 📁 Структура проекта

```
├── index.html          # Главная — выбор специальности
├── topics.html         # Выбор темы и режима теста
├── quiz.html           # Страница теста
├── results.html        # Результаты
│
├── css/
│   └── style.css       # Дизайн-система
│
├── js/
│   └── quiz.js         # Quiz engine
│
└── data/
    ├── config.json     # Реестр специальностей
    └── python/
        └── questions.json
```

---

## ➕ Как добавить новую специальность

1. Создай папку `data/<specialty>/`
2. Добавь `questions.json` в формате:
```json
{
  "questions": [
    {
      "id": 1,
      "category": "Название темы",
      "question": "Вопрос",
      "hint": "Подсказка (не раскрывает ответ)",
      "answer": "Полный ответ",
      "code_examples": ["# код"],
      "tags": ["tag1"]
    }
  ]
}
```
3. Добавь запись в `data/config.json`:
```json
{
  "id": "sql",
  "name": "SQL",
  "description": "Описание",
  "icon": "🗄️",
  "color": "#8B5CF6",
  "gradient": "linear-gradient(135deg, #2e1065 0%, #7c3aed 100%)",
  "available": true,
  "dataFile": "data/sql/questions.json"
}
```

---

## 🎮 Режимы теста

| Режим | Описание |
|-------|----------|
| ⚡ Спринт | Случайные вопросы, таймер 10 минут |
| 📚 Все вопросы | Весь банк вопросов по специальности |
| 🎯 По теме | Фильтрация по категории |

## 💡 Формат вопроса

1. Показывается вопрос
2. Три кнопки:
   - **✓ Я знаю** — сразу показывает ответ (засчитывается как "знал")
   - **💡 Подсказка** — показывает hint, затем выбор "вспомнил / не знаю"
   - **✗ Не знаю** — сразу показывает ответ (засчитывается как "не знал")

---

## 🛠 Технологии

- Vanilla HTML + CSS + JavaScript (без фреймворков)
- Telegram WebApp SDK
- GitHub Pages
