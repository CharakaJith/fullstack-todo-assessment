# node v20 as base image
FROM node:20

# set working directory
WORKDIR /app

# copy root package.json and package-lock.json files
COPY package*.json ./

# install dependencies 
RUN npm run install

# copy root .env files
COPY .env .env

# copy the app to the container
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=8000

# expose the port
EXPOSE 8000

# run the app
CMD ["npm", "start"]