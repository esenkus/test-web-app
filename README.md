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
* install fluxcd
* deploy app with `kubectl apply -f deploy`
* check the assigned NodePort for the service `kubectl get svc testwebapp`
* find out node port `kubectl get svc` the port will be the second port
* connect to the app
  * find out NodePort ip `kubectl get nodes -o wide`
  * connect to url `http://<node-ip>:<node-port>`
  * (optional) or forward the NodePort port `kubectl port-forward svc/testwebapp <nodeport>:8080` and connect with `http://localhost:<node-port>`

## Building docker image

* build image `docker build -t test-app .`
* run image `docker run -p 8080:8080 -d test-app`
* check if it is running by `docker ps`
* get into it, if needed with `docker exec -it [containerId] /bin/bash`