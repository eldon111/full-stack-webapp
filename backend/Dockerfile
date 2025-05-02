FROM node:22-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Set environment variables
#ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/server.js"]
