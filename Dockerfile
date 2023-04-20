FROM node:18-alpine
WORKDIR /app/ms-payment
COPY package.json ./
RUN npm install
COPY . ./
ENTRYPOINT npm start