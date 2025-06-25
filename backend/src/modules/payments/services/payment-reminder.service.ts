import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send payment due reminders daily at 9 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentDueReminders() {
    this.logger.log('Starting payment due reminder process...');

    try {
      // Get loans with payments due in the next 7 days or overdue
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const loansWithDuePayments = await this.prisma.loan.findMany({
        where: {
          status: { in: ['ACTIVE', 'DISBURSED'] },
          dueDate: {
            lte: dueDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payments: {
            where: {
              status: 'COMPLETED',
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      let reminderCount = 0;

      for (const loan of loansWithDuePayments) {
        try {
          // Calculate remaining balance
          const totalPaid = loan.payments.reduce(
            (sum, payment) => sum + parseFloat(payment.amount.toString()),
            0,
          );
          const remainingBalance = parseFloat(loan.totalAmount.toString()) - totalPaid;

          if (remainingBalance > 0 && loan.dueDate) {
            // Send payment due reminder
            await this.notificationService.sendPaymentDueReminderNotification(
              loan.userId,
              {
                amount: remainingBalance,
                dueDate: loan.dueDate.toISOString().split('T')[0],
                loanId: loan.id,
                user: {
                  email: loan.user.email,
                  firstName: loan.user.firstName,
                  lastName: loan.user.lastName,
                },
              },
            );

            reminderCount++;
            this.logger.log(
              `Payment reminder sent for loan ${loan.id}, user ${loan.user.email}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send payment reminder for loan ${loan.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Payment reminder process completed. ${reminderCount} reminders sent.`);
    } catch (error) {
      this.logger.error(`Payment reminder process failed: ${error.message}`);
    }
  }

  /**
   * Send overdue payment notifications daily at 2 PM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async sendOverduePaymentNotifications() {
    this.logger.log('Starting overdue payment notification process...');

    try {
      const today = new Date();

      const overdueLoans = await this.prisma.loan.findMany({
        where: {
          status: { in: ['ACTIVE', 'DISBURSED'] },
          dueDate: {
            lt: today,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payments: {
            where: {
              status: 'COMPLETED',
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      let overdueCount = 0;

      for (const loan of overdueLoans) {
        try {
          // Calculate remaining balance
          const totalPaid = loan.payments.reduce(
            (sum, payment) => sum + parseFloat(payment.amount.toString()),
            0,
          );
          const remainingBalance = parseFloat(loan.totalAmount.toString()) - totalPaid;

          if (remainingBalance > 0 && loan.dueDate) {
            // Calculate days overdue
            const daysOverdue = Math.floor(
              (today.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            // Send overdue notification
            await this.notificationService.sendPaymentDueReminderNotification(
              loan.userId,
              {
                amount: remainingBalance,
                dueDate: loan.dueDate.toISOString().split('T')[0],
                loanId: loan.id,
                user: {
                  email: loan.user.email,
                  firstName: loan.user.firstName,
                  lastName: loan.user.lastName,
                },
              },
            );

            overdueCount++;
            this.logger.log(
              `Overdue notification sent for loan ${loan.id}, ${daysOverdue} days overdue`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to send overdue notification for loan ${loan.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Overdue notification process completed. ${overdueCount} notifications sent.`);
    } catch (error) {
      this.logger.error(`Overdue notification process failed: ${error.message}`);
    }
  }

  /**
   * Manual method to send payment reminders for testing
   */
  async sendManualPaymentReminder(loanId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          where: {
            status: 'COMPLETED',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!loan) {
      throw new Error('Loan not found');
    }

    const totalPaid = loan.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()),
      0,
    );
    const remainingBalance = parseFloat(loan.totalAmount.toString()) - totalPaid;

    if (remainingBalance > 0 && loan.dueDate) {
      await this.notificationService.sendPaymentDueReminderNotification(
        loan.userId,
        {
          amount: remainingBalance,
          dueDate: loan.dueDate.toISOString().split('T')[0],
          loanId: loan.id,
          user: {
            email: loan.user.email,
            firstName: loan.user.firstName,
            lastName: loan.user.lastName,
          },
        },
      );

      this.logger.log(`Manual payment reminder sent for loan ${loanId}`);
    }
  }
} 