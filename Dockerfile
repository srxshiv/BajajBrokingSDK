FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install && yarn add typescript ts-node

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]