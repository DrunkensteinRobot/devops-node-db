# Use Node.js base image
FROM node:18

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy all other files
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
