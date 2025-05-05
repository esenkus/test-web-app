FROM node:18

WORKDIR /usr/src/app
COPY . .
EXPOSE 8080
WORKDIR /usr/src/app/backend
RUN npm install
CMD [ "node", "." ]