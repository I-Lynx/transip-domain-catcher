FROM node:18.20-alpine

LABEL org.opencontainers.image.source="https://github.com/I-Lynx/transip-domain-catcher"

# Create application directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Default environment variables
ENV TRANSIP_ACCESS_TOKEN=""
ENV CHECK_INTERVAL_SECONDS="15"
ENV DOMAINS="example.com,example.org"

# Run as non-root user
USER node

# Start application
CMD ["node", "src/index.js"]
