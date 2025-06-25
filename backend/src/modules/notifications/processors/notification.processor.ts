import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  loanId?: string;
}

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('send-notification')
  async handleNotification(job: Job<NotificationJob>) {
    this.logger.log(`Processing notification for user ID: ${job.data.userId}`);

    try {
      const { userId, type, title, message, loanId } = job.data;

      // Map string type to NotificationType enum
      let notificationType: any;
      switch (type) {
        case 'loan_decision':
          notificationType = 'LOAN_APPROVED'; // Default, will be updated based on message
          if (message.includes('approved')) {
            notificationType = 'LOAN_APPROVED';
          } else if (message.includes('rejected')) {
            notificationType = 'LOAN_REJECTED';
          }
          break;
        case 'payment_received':
          notificationType = 'PAYMENT_RECEIVED';
          break;
        case 'payment_due':
          notificationType = 'PAYMENT_DUE';
          break;
        case 'loan_disbursed':
          notificationType = 'LOAN_DISBURSED';
          break;
        default:
          notificationType = 'SYSTEM_ALERT';
      }

      // Create notification in database
      await this.prisma.notification.create({
        data: {
          userId,
          type: notificationType,
          title,
          message,
        },
      });

      // Simulate email/SMS sending (in production, this would integrate with real services)
      this.logger.log(
        `Sending ${type} notification to user ${userId}: ${title}`,
      );

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.logger.log(`Notification sent successfully to user ${userId}`);

      return { success: true, userId, type, title };
    } catch (error) {
      this.logger.error(
        `Error processing notification for user ${job.data.userId}:`,
        error,
      );
      throw error;
    }
  }
}
