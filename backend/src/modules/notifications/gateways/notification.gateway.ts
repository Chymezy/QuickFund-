import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

export interface AdminNotification {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(WsJwtGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private adminSockets: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Extract user info from JWT token
    const user = client.handshake.auth.user;
    if (user && user.role === 'ADMIN') {
      this.adminSockets.set(user.id, client);
      this.logger.log(`Admin ${user.email} connected`);
      
      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to admin notifications',
        userId: user.id,
        role: user.role,
      });
    } else {
      this.logger.log(`Regular user connected: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove admin socket if it was an admin
    const user = client.handshake.auth.user;
    if (user && user.role === 'ADMIN') {
      this.adminSockets.delete(user.id);
      this.logger.log(`Admin ${user.email} disconnected`);
    }
  }

  @SubscribeMessage('join-admin-room')
  handleJoinAdminRoom(client: Socket) {
    const user = client.handshake.auth.user;
    if (user && user.role === 'ADMIN') {
      client.join('admin-room');
      client.emit('joined-admin-room', {
        message: 'Joined admin notification room',
      });
      this.logger.log(`Admin ${user.email} joined admin room`);
    } else {
      client.emit('error', {
        message: 'Unauthorized access to admin room',
      });
    }
  }

  @SubscribeMessage('leave-admin-room')
  handleLeaveAdminRoom(client: Socket) {
    const user = client.handshake.auth.user;
    if (user && user.role === 'ADMIN') {
      client.leave('admin-room');
      client.emit('left-admin-room', {
        message: 'Left admin notification room',
      });
      this.logger.log(`Admin ${user.email} left admin room`);
    }
  }

  async sendAdminNotification(notification: Omit<AdminNotification, 'timestamp'>) {
    const adminNotification: AdminNotification = {
      ...notification,
      timestamp: new Date(),
    };

    // Send to all admin sockets
    this.server.to('admin-room').emit('admin-notification', adminNotification);
    
    // Also send to individual admin sockets for redundancy
    this.adminSockets.forEach((socket, adminId) => {
      socket.emit('admin-notification', adminNotification);
    });

    this.logger.log(`Admin notification sent: ${notification.title}`);
    return adminNotification;
  }

  async sendUserNotification(userId: string, notification: any) {
    // Send to specific user if they're connected
    this.server.to(`user-${userId}`).emit('user-notification', notification);
    this.logger.log(`User notification sent to ${userId}: ${notification.title}`);
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(client: Socket, userId: string) {
    const user = client.handshake.auth.user;
    if (user && user.id === userId) {
      client.join(`user-${userId}`);
      client.emit('joined-user-room', {
        message: 'Joined user notification room',
        userId,
      });
      this.logger.log(`User ${user.email} joined user room ${userId}`);
    } else {
      client.emit('error', {
        message: 'Unauthorized access to user room',
      });
    }
  }

  @SubscribeMessage('leave-user-room')
  handleLeaveUserRoom(client: Socket, userId: string) {
    const user = client.handshake.auth.user;
    if (user && user.id === userId) {
      client.leave(`user-${userId}`);
      client.emit('left-user-room', {
        message: 'Left user notification room',
        userId,
      });
      this.logger.log(`User ${user.email} left user room ${userId}`);
    }
  }

  // Broadcast system-wide notifications
  async broadcastSystemNotification(notification: Omit<AdminNotification, 'timestamp'>) {
    const systemNotification: AdminNotification = {
      ...notification,
      timestamp: new Date(),
    };

    this.server.emit('system-notification', systemNotification);
    this.logger.log(`System notification broadcasted: ${notification.title}`);
    return systemNotification;
  }

  // Get connected admin count
  getConnectedAdminCount(): number {
    return this.adminSockets.size;
  }

  // Get all connected admin IDs
  getConnectedAdminIds(): string[] {
    return Array.from(this.adminSockets.keys());
  }
} 