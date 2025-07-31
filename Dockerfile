FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (without running postinstall)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
