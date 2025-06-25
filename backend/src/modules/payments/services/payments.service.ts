import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { VirtualAccountService } from './virtual-account.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { MakePaymentDto } from '../dto/make-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { PaymentStatus, PaymentType } from '@prisma/client';
import { ResponseMapper } from '../../../common/utils/response-mapper.util';
import { GeneratorUtil } from '../../../common/utils/generator.util';
import { LoanCalculatorUtil } from '../../../common/utils/loan-calculator.util';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly virtualAccountService: VirtualAccountService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Make a loan repayment
   */
  async makePayment(
    userId: string,
    makePaymentDto: MakePaymentDto,
  ): Promise<PaymentResponseDto> {
    this.logger.log(`makePayment called with userId=${userId}, loanId=${makePaymentDto.loanId}`);
    // Verify loan exists and belongs to user
    const loan = await this.prisma.loan.findFirst({
      where: {
        id: makePaymentDto.loanId,
        userId,
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
      },
    });
    this.logger.log(`Loan lookup result: ${loan ? 'FOUND' : 'NOT FOUND'}`);
    if (!loan) {
      this.logger.error(`Loan not found for userId=${userId}, loanId=${makePaymentDto.loanId}`);
      throw new NotFoundException('Loan not found');
    }

    // Check if loan is active or disbursed
    if (!['ACTIVE', 'DISBURSED'].includes(loan.status)) {
      throw new BadRequestException('Loan is not active for payments');
    }

    // Generate payment reference
    const reference = GeneratorUtil.generatePaymentReference();

    // Process payment based on method
    let payment;
    if (makePaymentDto.paymentMethod === 'virtual_account') {
      payment = await this.processVirtualAccountPayment(
        userId,
        makePaymentDto,
        reference,
      );
    } else {
      // Default to card payment (simulated)
      payment = await this.processCardPayment(
        userId,
        makePaymentDto,
        reference,
      );
    }

    // Send payment received notification
    try {
      await this.notificationService.sendPaymentReceivedNotification(userId, {
        id: payment.id,
        amount: parseFloat(makePaymentDto.amount.toString()),
        loanId: makePaymentDto.loanId,
        user: {
          email: loan.user.email,
          firstName: loan.user.firstName,
          lastName: loan.user.lastName,
      },
    });
    } catch (error) {
      console.error('Failed to send payment notification:', error);
    }

    return ResponseMapper.mapPaymentToResponseDto(payment);
  }

  /**
   * Process virtual account payment
   */
  private async processVirtualAccountPayment(
    userId: string,
    makePaymentDto: MakePaymentDto,
    reference: string,
  ) {
    // Require and validate virtual account number
    if (!makePaymentDto.virtualAccountNumber || makePaymentDto.virtualAccountNumber !== '1234567890') {
      throw new BadRequestException('Invalid or missing virtual account number. Use 1234567890 for demo.');
    }

    // Check if user has sufficient balance
    const balance = await this.virtualAccountService.getAccountBalance(userId);
    if (balance < makePaymentDto.amount) {
      throw new BadRequestException('Insufficient balance in virtual account');
    }

    // Debit virtual account
    await this.virtualAccountService.debitAccount(
      userId,
      makePaymentDto.amount,
      reference,
    );

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        loanId: makePaymentDto.loanId,
        amount: makePaymentDto.amount,
        type: makePaymentDto.type,
        status: 'COMPLETED',
        reference,
        gateway: 'virtual_account',
        processedAt: new Date(),
      },
    });

    return payment;
  }

  /**
   * Process card payment (simulated)
   */
  private async processCardPayment(
    userId: string,
    makePaymentDto: MakePaymentDto,
    reference: string,
  ) {
    // Require and validate mock card details
    if (
      !makePaymentDto.cardNumber ||
      !makePaymentDto.expiry ||
      !makePaymentDto.cvv ||
      makePaymentDto.cardNumber !== '4111111111111111' ||
      makePaymentDto.expiry !== '12/34' ||
      makePaymentDto.cvv !== '123'
    ) {
      throw new BadRequestException('Invalid or missing card details. Use 4111111111111111 / 12/34 / 123 for demo.');
    }

    // Simulate card payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        loanId: makePaymentDto.loanId,
        amount: makePaymentDto.amount,
        type: makePaymentDto.type,
        status: 'COMPLETED',
        reference,
        gateway: 'card',
        gatewayRef: GeneratorUtil.generateTransactionId(),
        processedAt: new Date(),
      },
    });

    return payment;
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    payments: PaymentResponseDto[];
    pagination: { page: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          loan: {
            userId,
          },
        },
        include: {
          loan: {
            select: {
              id: true,
              amount: true,
              purpose: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({
        where: {
          loan: {
            userId,
          },
        },
      }),
    ]);

    return {
      payments: ResponseMapper.mapArrayToResponseDto(
        payments,
        ResponseMapper.mapPaymentToResponseDto,
      ),
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(
    userId: string,
    paymentId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        loan: {
          userId,
        },
      },
      include: {
        loan: {
          select: {
            id: true,
            amount: true,
            purpose: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return ResponseMapper.mapPaymentToResponseDto(payment);
  }

  /**
   * Get payment history for a specific loan
   */
  async getLoanPaymentHistory(
    userId: string,
    loanId: string,
    page = 1,
    limit = 10,
    status?: string,
  ): Promise<{
    payments: PaymentResponseDto[];
    pagination: { page: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    
    // Verify loan exists and belongs to user
    const loan = await this.prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const where: any = { loanId };
    if (status) {
      where.status = status as PaymentStatus;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          loan: {
            select: {
              id: true,
              amount: true,
              purpose: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: ResponseMapper.mapArrayToResponseDto(
        payments,
        ResponseMapper.mapPaymentToResponseDto,
      ),
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all payments (admin only)
   */
  async getAllPayments(
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<{
    payments: PaymentResponseDto[];
    pagination: { page: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as PaymentStatus } : {};

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          loan: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: ResponseMapper.mapArrayToResponseDto(
        payments,
        ResponseMapper.mapPaymentToResponseDto,
      ),
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(): Promise<{
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averagePaymentAmount: number;
  }> {
    const [
      totalPayments,
      totalAmount,
      completedPayments,
      failedPayments,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
    ]);

    const averagePaymentAmount =
      totalPayments > 0
        ? parseFloat(totalAmount._sum.amount?.toString() || '0') / totalPayments
        : 0;

    return {
      totalPayments,
      totalAmount: parseFloat(totalAmount._sum.amount?.toString() || '0'),
      completedPayments,
      failedPayments,
      pendingPayments,
      averagePaymentAmount,
    };
  }

  /**
   * Export payments to CSV
   */
  async exportPaymentsToCSV(): Promise<string> {
    const payments = await this.prisma.payment.findMany({
      include: {
        loan: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create CSV header
    const csvHeader = [
      'ID',
      'User Name',
      'Email',
      'Loan ID',
      'Amount',
      'Type',
      'Status',
      'Reference',
      'Gateway',
      'Processed At',
      'Created At',
    ].join(',');

    // Create CSV rows
    const csvRows = payments.map((payment) =>
      [
        payment.id,
        `${payment.loan.user.firstName} ${payment.loan.user.lastName}`,
        payment.loan.user.email,
        payment.loanId,
        payment.amount.toString(),
        payment.type,
        payment.status,
        payment.reference,
        payment.gateway || '',
        payment.processedAt?.toISOString() || '',
        payment.createdAt.toISOString(),
      ].join(','),
    );

    return [csvHeader, ...csvRows].join('\n');
  }

  /**
   * Get loan payment summary
   */
  async getLoanPaymentSummary(loanId: string): Promise<{
    totalPaid: number;
    remainingBalance: number;
    nextPaymentDue: number;
    paymentHistory: PaymentResponseDto[];
  }> {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        loanId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPaid = payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()),
      0,
    );

    const remainingBalance = LoanCalculatorUtil.calculateRemainingBalance(
      parseFloat(loan.totalAmount.toString()),
      totalPaid,
    );

    const nextPaymentDue = parseFloat(loan.monthlyPayment.toString());

    return {
      totalPaid,
      remainingBalance,
      nextPaymentDue,
      paymentHistory: ResponseMapper.mapArrayToResponseDto(
        payments,
        ResponseMapper.mapPaymentToResponseDto,
      ),
    };
  }
}
