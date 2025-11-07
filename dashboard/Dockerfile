# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy all other files
COPY . .

# Expose the dashboard port
EXPOSE 8081

# Run the dashboard server
CMD ["npm", "start"]
