import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const userId = req.user.id;
    const notifications = await this.notificationService.getUserNotifications(
      userId,
      limit,
      offset,
    );

    return {
      success: true,
      data: notifications,
      pagination: {
        limit,
        offset,
        total: notifications.length,
      },
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadNotificationCount(userId);

    return {
      success: true,
      data: { unreadCount: count },
    };
  }

  @Post(':id/mark-read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.id;
    const notification = await this.notificationService.markNotificationAsRead(
      notificationId,
      userId,
    );

    return {
      success: true,
      data: notification,
    };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    
    // Get all unread notifications
    const unreadNotifications = await this.notificationService.getUserNotifications(
      userId,
      1000, // Large limit to get all
      0,
    );

    // Mark each as read
    const promises = unreadNotifications
      .filter(n => !n.isRead)
      .map(n => this.notificationService.markNotificationAsRead(n.id, userId));

    await Promise.all(promises);

    return {
      success: true,
      message: 'All notifications marked as read',
      count: unreadNotifications.filter(n => !n.isRead).length,
    };
  }
} 