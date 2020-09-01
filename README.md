# Chat Front

This is a demostration chat front-end for gRPC to be used in conjunction with [chat-svc](https://bitbucket.org/kroekle/chat-svc).  The docker containers that are an output from this source are publicly available on GCR (you could skip the build steps and just deploy the continers).  This project is licensed under the terms of the MIT license.  The author holds no responsibility for the use.

## Target Audience

The target audience for this demo is Engineers that want to test using gRPC-Web in their browser based applications.

## Prerequisites
This demo assumes that you have a working Kubernetes cluster with Istio setup and kubectl command line access to it.  The author strictly works in a Linux environment, so some commands may need to be altered.  Packaging this part of the app also requires a docker runtime to be installed.

All three of the major cloud providers have a managed kuberenetes offering.  To the best of my knowledge (at the current time), only Google GKE offers a managed Istio along with it.  All of these examples were testing running in the managed GKE with Istio enabled cluster.

Coe was written tested using Visual Studio Code and relies on the include scripts  in the package.json file.

Makeing changes also assumes you know TypeScript and ReactJs as that is what this example is using.

## Description of chat-front
chat-front is not production quality, but instead meant to demonstrate the basics of grpc-web.  It includes one server streaming rpc and multiple Unary rpc's.  The important gRPC code is housed in Chat.tsx, Users.tsx, and grpc.services.ts.

### grpc.services.ts
grpc.services.ts is nothing more than a convenience method that sets up the ChatServiceClient that is provided by the generated code.  It deals with local vs server URLs and would be the place to put credentials and other options that you would need for all calls.  If you would have multiple services, I would make new static functions in here for those as well.

### Chat.tsx
chat.tsx is where most of the fun happens.  An example of the server streaming call is:

```
      const person = new Person();
      person.setName(myName);
      person.setActive(Active.ACTIVE);
      const reg = new Register();
      reg.setPerson(person);
      const stream = GrpcClients.chat().registerAndStream(reg, {});
      stream.on('data', (res) => {
```

The Person & Register objects are provided by the code generation and need to use the setters/getters when using them.  The registerAndStream function is also provided by the code generation and returns a stream object.  The stream object has an on method the takes an event type and a callback.  You will get the data with the data event type, other event types are error, status, metadata, and end.

### Users.tsx
users.tsx has one example of a Unary call:

```
   GrpcClients.chat().getActivePeople(new Empty(), {}, (_err, res) => {
      setMyPeople(res);
    });
```

This example is just retrieving data, so it passes in an Empty object, the callback here combines both the error and result into one callback (it goes without saying I don't do a good job here of error checking)


## Running locally
The front end is depended on the chat-svc and a envoy proxy (expained in the chat-svc).  You could pull the chat-svc & chat-front and build the envoy proxy and run locally without any further building, but what fun would that be.

### Generated Protobuf files
The front end relies on files generated from the proto files (in the proto/ folder).  Any changes in the proto files (and if there are, they should be sync'd with chat-svc) will require them to be rebuilt.

```
npm run proto
```

BTW, the proto:gen script is setup to generate both javascript and typescript files.  If you don't use typescript you can the "+dts" out of  "--grpc-web_out=import_style=commonjs+dts".  It also loops through all the .proto files in the /proto folder, so you don't have to specify them individually.  Also, the proto:fix script is there because I could not get eslint to stop checking the generated files (no supprise, but I'm not a frontend developer by trade).

### Install & Run
Normal npm commands to get running
```
npm install
npm start
```

You should now be able to hit got to http://localhost:3001 and use the running app.

## Packaging and Depolying

The included dockerfile will package a runnable artifact.  You can tag and push to your own repository.  Also included is a sample yaml file that will deploy to a Kubernetes cluster.  You should first have the [chat-svc](https://bitbucket.org/kroekle/chat-svc) installed in order for this to properly function.  So, I'll wait here as you do that.


### Docker build
```
docker build -t gcr.io/cloud-native-madison/chat-front:0.1.1 .
```

(replace gcr.io/cloud-native-madison with your repository)

### Docker push
```
docker push gcr.io/cloud-native-madison/chat-front:0.1.1
```

(Again, replace with your repo)

Pushing to GCR uses [docker-credential-gcr](https://cloud.google.com/container-registry/docs/advanced-authentication#standalone-helper) for authentication

### Deploying to Kubernetes
The inlucded chat-front.yaml file has needed changed to run in your own enviromnet.  At a minimum, the chat-gateway (from chat-svc) or equivilant (if you had your own gateway object that should be changed in the VirtualService)) must be installed and the host name on the VirtualService>spec>hosts needs to be changed to a different domain.  The image name in Deployment>spec>template>spec>containers>image will likely need changing as well, but you can use the specified image if you just want to test my image.

This will create three objects in k8s; a Deployment, a Service, and a VirtualService.

Also, if you plan on chaning he context of the gRPC backend service (chat-svc), then you will need to update update the path in grpc.services.ts and build your own chat-front container (my container will not work)

After the chat-front.yaml changes:
```
kubectl apply -f chat-front.yaml
```
After the continer starts up, you should be able to hit the root of the domain you specified to see the working app.

## Cleaning up Kubernetes
You can remove all of the k8s objects by do doing a delete with the chat-front.yaml file:

```
kubectl delete -f chat-front.yaml
```

## Important NPM included scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run proto`

This command will generate the necessary protobuf sources and put them in src/gen

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.


