import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:customer')
  handleSubscribe(client: Socket, customerId: number) {
    const room = `customer:${customerId}`;
    void client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
  }

  notifyCustomer(customerId: number, notification: any) {
    const room = `customer:${customerId}`;
    this.server.to(room).emit('notification:new', notification);
    this.logger.log(`Notification sent to ${room}: ${notification.title}`);
  }
}
