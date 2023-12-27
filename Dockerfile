# Use the official Node.js image as a base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Copy the .env file to the working directory
COPY .env .env

# Expose the port on which your Nest.js application will run
EXPOSE 3000

# Command to start your Nest.js application
CMD ["npm", "run", "start:prod"]
