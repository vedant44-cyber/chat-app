FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port 5173
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"] 