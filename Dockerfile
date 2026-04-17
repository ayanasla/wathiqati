# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run install:all --production

# Copy source code
COPY . .

# Build frontend
RUN npm run frontend:build

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]