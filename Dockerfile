FROM node:18

LABEL org.opencontainers.image.source=https://github.com/esenkus/test-web-app

WORKDIR /usr/src/app
COPY . .
EXPOSE 8080
WORKDIR /usr/src/app/backend
RUN npm install
CMD [ "node", "." ]