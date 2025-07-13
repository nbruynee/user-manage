FROM node:18-alpine

WORKDIR /app

COPY notification-service/package.json ./
COPY notification-service/package-lock.json ./

RUN npm install

# Copy the rest of notification service
COPY notification-service/. .

# Open the port that notification service listens on
EXPOSE 8082

# Define command to run notification service
CMD ["node", "notification-service/app.js"]