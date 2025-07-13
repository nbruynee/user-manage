FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

# Install dependencies of main backend
RUN npm install

COPY . .

# Open the port that the application listens on
EXPOSE 8081

# Define command to run the application
CMD ["node", "src/server.js"]