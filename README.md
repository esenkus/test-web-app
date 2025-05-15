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

## Advanced local setup with kubernetes
* install kubernetes
* deploy app with `kubectl apply -f deploy`
* check the ip and port of the app `kubectl get services -n team1`. The ip will be ExternalIP and the port will be second one in Port column
* connect to the app
  * connect to url `http://<node-ip>:<node-port>`
* uninstall app with `kubectl delete -f deploy`

## Building docker image
For local testing you might just want to build and run image without any kubernetes.
* build image `docker build -t test-app .`
* run image `docker run -p 8080:8080 -d test-app`
* check if it is running by `docker ps`
* get into it, if needed with `docker exec -it [containerId] /bin/bash`