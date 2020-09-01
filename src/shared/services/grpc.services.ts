import { ChatServiceClient } from '../../gen/chat_grpc_web_pb';

const localDev = 'http://localhost:9095';

// if you would want to run the services on a different host, use something like the following
// const normalUrl = `https://${window.location.hostname.replace('chat', 'chat-rpc')}:443`;
const normalUrl = `http://${window.location.hostname}:80`;

const fullUrl = window.location.host.includes('localhost')?localDev:normalUrl;
const chat:ChatServiceClient = new ChatServiceClient(fullUrl, null, null);

export class GrpcClients {

  static chat = ():ChatServiceClient => {
    return chat;
  }
}
