import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmailService } from './email.service';
import { NotificationGateway } from '../gateways/notification.gateway';

export interface NotificationJob {
  userId: string;
  type: string;
  title: string;
  message: string;
  loanId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async sendWelcomeNotification(userId: string, userData: { email: string; firstName: string; lastName: string }) {
    try {
      // Send welcome email
      await this.emailService.sendWelcomeEmail(userData.email, {
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'welcome',
        title: 'Welcome to QuickFund! 🎉',
        message: `Welcome ${userData.firstName}! Your account has been successfully created. You can now apply for loans and manage your finances.`,
        metadata: { email: userData.email },
      } as NotificationJob);

      // Send admin notification
      await this.notificationGateway.sendAdminNotification({
        type: 'new_user_registered',
        title: 'New User Registration',
        message: `New user ${userData.firstName} ${userData.lastName} (${userData.email}) has registered.`,
        metadata: { userId, email: userData.email },
      });

      this.logger.log(`Welcome notification sent for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending welcome notification for user ${userId}:`, error);
      throw error;
    }
  }

  async sendLoanApplicationNotification(
    userId: string, 
    loanData: { 
      id: string; 
      amount: number; 
      purpose: string;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'loan_application',
        title: '📝 Loan Application Received',
        message: `Your loan application for ₦${loanData.amount.toLocaleString()} has been received and is being processed.`,
        loanId: loanData.id,
        metadata: { amount: loanData.amount, purpose: loanData.purpose },
      } as NotificationJob);

      // Send admin notification
      await this.notificationGateway.sendAdminNotification({
        type: 'new_loan_application',
        title: 'New Loan Application',
        message: `New loan application received from ${loanData.user.firstName} ${loanData.user.lastName} for ₦${loanData.amount.toLocaleString()}.`,
        metadata: { userId, loanId: loanData.id, amount: loanData.amount, purpose: loanData.purpose },
      });

      this.logger.log(`Loan application notification sent for user ${userId}, loan ${loanData.id}`);
    } catch (error) {
      this.logger.error(`Error sending loan application notification for user ${userId}:`, error);
      throw error;
    }
  }

  async sendLoanApprovedNotification(
    userId: string, 
    loanData: { 
      id: string; 
      amount: number; 
      approvedAmount: number;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Send loan approved email
      await this.emailService.sendLoanApprovedEmail(loanData.user.email, {
        firstName: loanData.user.firstName,
        loanAmount: loanData.amount,
        approvedAmount: loanData.approvedAmount,
        loanId: loanData.id,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'loan_approved',
        title: '🎉 Loan Approved!',
        message: `Congratulations! Your loan application for ₦${loanData.approvedAmount.toLocaleString()} has been approved.`,
        loanId: loanData.id,
        metadata: { amount: loanData.amount, approvedAmount: loanData.approvedAmount },
      } as NotificationJob);

      // Send admin notification
      await this.notificationGateway.sendAdminNotification({
        type: 'loan_approved',
        title: 'Loan Application Approved',
        message: `Loan application ${loanData.id} for ₦${loanData.approvedAmount.toLocaleString()} has been approved.`,
        metadata: { userId, loanId: loanData.id, amount: loanData.approvedAmount },
      });

      this.logger.log(`Loan approved notification sent for user ${userId}, loan ${loanData.id}`);
    } catch (error) {
      this.logger.error(`Error sending loan approved notification for user ${userId}:`, error);
      throw error;
    }
  }

  async sendLoanRejectedNotification(
    userId: string, 
    loanData: { 
      id: string; 
      amount: number;
      reason?: string;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Send loan rejected email
      await this.emailService.sendLoanRejectedEmail(loanData.user.email, {
        firstName: loanData.user.firstName,
        loanAmount: loanData.amount,
        loanId: loanData.id,
        reason: loanData.reason,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'loan_rejected',
        title: 'Loan Application Update',
        message: `Your loan application for ₦${loanData.amount.toLocaleString()} could not be approved at this time.`,
        loanId: loanData.id,
        metadata: { amount: loanData.amount, reason: loanData.reason },
      } as NotificationJob);

      // Send admin notification
      await this.notificationGateway.sendAdminNotification({
        type: 'loan_rejected',
        title: 'Loan Application Rejected',
        message: `Loan application ${loanData.id} for ₦${loanData.amount.toLocaleString()} has been rejected.`,
        metadata: { userId, loanId: loanData.id, amount: loanData.amount, reason: loanData.reason },
      });

      this.logger.log(`Loan rejected notification sent for user ${userId}, loan ${loanData.id}`);
    } catch (error) {
      this.logger.error(`Error sending loan rejected notification for user ${userId}:`, error);
      throw error;
    }
  }

  async sendPaymentReceivedNotification(
    userId: string, 
    paymentData: { 
      id: string; 
      amount: number; 
      loanId: string;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Send payment received email
      await this.emailService.sendPaymentReceivedEmail(paymentData.user.email, {
        firstName: paymentData.user.firstName,
        amount: paymentData.amount,
        loanId: paymentData.loanId,
        paymentId: paymentData.id,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'payment_received',
        title: '💰 Payment Received!',
        message: `Payment of ₦${paymentData.amount.toLocaleString()} has been received and applied to your loan.`,
        loanId: paymentData.loanId,
        metadata: { amount: paymentData.amount, paymentId: paymentData.id },
      } as NotificationJob);

      // Send admin notification
      await this.notificationGateway.sendAdminNotification({
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ₦${paymentData.amount.toLocaleString()} received for loan ${paymentData.loanId}.`,
        metadata: { userId, loanId: paymentData.loanId, amount: paymentData.amount, paymentId: paymentData.id },
      });

      this.logger.log(`Payment received notification sent for user ${userId}, payment ${paymentData.id}`);
    } catch (error) {
      this.logger.error(`Error sending payment received notification for user ${userId}:`, error);
      throw error;
    }
  }

  async sendPaymentDueNotification(
    userId: string, 
    paymentData: { 
      amount: number; 
      dueDate: string; 
      loanId: string;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Send payment due email
      await this.emailService.sendPaymentDueEmail(paymentData.user.email, {
        firstName: paymentData.user.firstName,
        amount: paymentData.amount,
        dueDate: paymentData.dueDate,
        loanId: paymentData.loanId,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'payment_due',
        title: '⚠️ Payment Due Reminder',
        message: `Payment of ₦${paymentData.amount.toLocaleString()} is due on ${paymentData.dueDate}.`,
        loanId: paymentData.loanId,
        metadata: { amount: paymentData.amount, dueDate: paymentData.dueDate },
      } as NotificationJob);

      this.logger.log(`Payment due notification sent for user ${userId}, loan ${paymentData.loanId}`);
    } catch (error) {
      this.logger.error(`Error sending payment due notification for user ${userId}:`, error);
      throw error;
    }
  }

  async sendPaymentDueReminderNotification(
    userId: string, 
    paymentData: { 
      amount: number; 
      dueDate: string; 
      loanId: string;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Send payment due email
      await this.emailService.sendPaymentDueEmail(paymentData.user.email, {
        firstName: paymentData.user.firstName,
        amount: paymentData.amount,
        dueDate: paymentData.dueDate,
        loanId: paymentData.loanId,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'payment_due_reminder',
        title: '⏰ Payment Due Soon',
        message: `Your payment of ₦${paymentData.amount.toLocaleString()} is due on ${paymentData.dueDate}. Please make your payment on time.`,
        loanId: paymentData.loanId,
        metadata: { amount: paymentData.amount, dueDate: paymentData.dueDate },
      } as NotificationJob);

      // Send admin notification for overdue payments
      const dueDate = new Date(paymentData.dueDate);
      const today = new Date();
      if (dueDate < today) {
        await this.notificationGateway.sendAdminNotification({
          type: 'payment_overdue',
          title: 'Payment Overdue',
          message: `Payment of ₦${paymentData.amount.toLocaleString()} is overdue for loan ${paymentData.loanId}.`,
          metadata: { userId, loanId: paymentData.loanId, amount: paymentData.amount, dueDate: paymentData.dueDate },
        });
      }

      this.logger.log(`Payment due reminder sent for user ${userId}, loan ${paymentData.loanId}`);
    } catch (error) {
      this.logger.error(`Error sending payment due reminder for user ${userId}:`, error);
      throw error;
    }
  }

  async sendLoanDisbursedNotification(
    userId: string, 
    loanData: { 
      id: string; 
      amount: number; 
      accountNumber: string;
      user: { email: string; firstName: string; lastName: string };
    }
  ) {
    try {
      // Send loan disbursed email
      await this.emailService.sendLoanDisbursedEmail(loanData.user.email, {
        firstName: loanData.user.firstName,
        amount: loanData.amount,
        loanId: loanData.id,
        accountNumber: loanData.accountNumber,
      });

      // Create in-app notification
      await this.notificationQueue.add('send-notification', {
        userId,
        type: 'loan_disbursed',
        title: '💸 Loan Disbursed!',
        message: `Your loan of ₦${loanData.amount.toLocaleString()} has been disbursed to your account ${loanData.accountNumber}.`,
        loanId: loanData.id,
        metadata: { amount: loanData.amount, accountNumber: loanData.accountNumber },
      } as NotificationJob);

      // Send admin notification
      await this.notificationGateway.sendAdminNotification({
        type: 'loan_disbursed',
        title: 'Loan Disbursed',
        message: `Loan ${loanData.id} of ₦${loanData.amount.toLocaleString()} has been disbursed to account ${loanData.accountNumber}.`,
        metadata: { userId, loanId: loanData.id, amount: loanData.amount, accountNumber: loanData.accountNumber },
      });

      this.logger.log(`Loan disbursed notification sent for user ${userId}, loan ${loanData.id}`);
    } catch (error) {
      this.logger.error(`Error sending loan disbursed notification for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit = 10, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async markNotificationAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async getUnreadNotificationCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
} 