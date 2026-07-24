import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:order')
  handleSubscribeOrder(client: Socket, orderId: string) {
    const room = `order:${orderId}`;
    void client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
  }

  @SubscribeMessage('unsubscribe:order')
  handleUnsubscribeOrder(client: Socket, orderId: string) {
    const room = `order:${orderId}`;
    void client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
  }

  notifyOrderStatus(orderId: string, status: string, reason?: string) {
    const room = `order:${orderId}`;
    this.server.to(room).emit('order:status', { orderId, status, reason: reason ?? null });
    this.logger.log(`Status update sent to ${room}: ${status}${reason ? ` (${reason})` : ''}`);
  }
}
