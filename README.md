# Test Web App

## Building Dev environment

### Prerequisites
* Npm
* Node

TODO: instructions how to install requirements

### Install dependencies
```
cd backend
npm install
```

### run server
```
cd backend
node .
```

## Building docker image

* build image `docker build -t test-app .`
* run image `docker run -p 8080:8080 -d test-app`
* check if it is running by `docker ps`
* get into it, if needed with `docker exec -it [containerId] /bin/bash`