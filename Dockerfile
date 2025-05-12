FROM node:20-alpine

# Install ffmpeg
RUN apk update
RUN apk add ffmpeg alpine-sdk
RUN apk add --update --no-cache python3 py3-pip
RUN pip3 install --no-cache --upgrade pip setuptools

# Set environment variables for configuration
ENV PORT=3000
ENV DATABASE_URL="file:/usr/src/app/sqlite.db"

# Add maintainer label
LABEL maintainer="Quentin Laffont <contact@qlaffont.com>"

RUN npm install pnpm -g

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma database
RUN pnpm generate

# Expose the port the app runs on
EXPOSE $PORT

# Command to run the app
CMD ["pnpm", "run", "dev"]
