# Використовуємо базовий образ Node.js
FROM node:14

# Встановлюємо робочу директорію в контейнері
WORKDIR /app

# Копіюємо залежності проекту у контейнер
COPY package.json package-lock.json /app/

# Встановлюємо залежності
RUN npm install

# Копіюємо всі файли проекту у контейнер
COPY . /app

# Виконуємо команду для запуску коду при старті контейнера
CMD ["node", "index.js"]
# Викладаємо TCP-порт
EXPOSE 3000
