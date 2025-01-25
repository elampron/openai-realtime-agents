FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application with production settings
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Add dummy API key for build time only
ENV OPENAI_API_KEY="dummy-key-for-build"
# Build with experimental features
RUN NEXT_SKIP_STATIC_OPTIMIZATION=true npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"] 