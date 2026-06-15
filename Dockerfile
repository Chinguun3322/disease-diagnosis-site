FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install deps (copy package files first for better cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# Start the app (Render sets PORT env var)
CMD ["node", "app.js"]
