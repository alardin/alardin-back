import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: /\/alarm-.+/ })
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() public server: Server
  @SubscribeMessage('events')
  handleEvent(@MessageBody() msgBody, @ConnectedSocket() client: Socket) {
      console.log(msgBody);
  }

  afterInit(server: Server) {
      console.log('websocket init')
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('connected', socket.nsp.name)   
  }

  handleDisconnect(client: Socket) {
      
  }

}
