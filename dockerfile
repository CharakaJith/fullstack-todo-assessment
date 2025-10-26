# node v20 as base image
FROM node:20

# set working directory
WORKDIR /app

# copy root package.json and package-lock.json files
COPY package*.json ./

# install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

# install dependencies 
RUN npm install

# copy the app to the container
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=8000

# expose the port
EXPOSE 8000

# make wait-for-db.sh executable
RUN chmod +x wait-for-db.sh

# run migrations and start the app
CMD ["sh", "-c", "./wait-for-db.sh db && npm run migrate:up && npm run start"]