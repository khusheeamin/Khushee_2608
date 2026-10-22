# Official lightweight Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Set default environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Start backend server
CMD ["node", "server.js"]
