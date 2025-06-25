import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ScoringService } from './scoring.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { ApplyLoanDto } from '../dto/apply-loan.dto';
import { LoanResponseDto } from '../dto/loan-response.dto';
import { LoanStatus } from '@prisma/client';
import { ResponseMapper } from '../../../common/utils/response-mapper.util';
import { LoanCalculatorUtil } from '../../../common/utils/loan-calculator.util';

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly notificationService: NotificationService,
    @InjectQueue('loan-scoring') private readonly loanScoringQueue: Queue,
  ) {}

  /**
   * Apply for a new loan
   */
  async applyForLoan(
    userId: string,
    applyLoanDto: ApplyLoanDto,
  ): Promise<LoanResponseDto> {
    // Check if user has active loans
    const activeLoans = await this.prisma.loan.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE'] },
      },
    });

    if (activeLoans.length > 0) {
      throw new BadRequestException(
        'You have active loans. Please complete them before applying for a new loan.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        loans: true,
        virtualAccount: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate loan details using utility
    const { amount, purpose, term } = applyLoanDto;
    const loanTerms = LoanCalculatorUtil.calculateLoanTerms(amount, term);

    // Create loan record
    const loan = await this.prisma.loan.create({
      data: {
        userId,
        amount,
        purpose,
        term,
        interestRate: loanTerms.interestRate,
        monthlyPayment: loanTerms.monthlyPayment,
        totalAmount: loanTerms.totalAmount,
        status: 'PENDING',
      },
    });

    // Get user's loan and payment history for scoring
    const loanHistory = await this.prisma.loan.findMany({
      where: { userId, id: { not: loan.id } },
      select: { status: true },
    });

    const paymentHistory = await this.prisma.payment.findMany({
      where: {
        loan: { userId },
      },
      select: { status: true },
    });

    // Add loan scoring job to queue
    await this.loanScoringQueue.add('score-loan', {
      loanId: loan.id,
      userId,
      amount: Number(amount),
      income: Number(user.monthlyIncome || 0),
      employmentStatus: user.employmentStatus || 'UNEMPLOYED',
      loanHistory,
      paymentHistory,
    });

    // Send loan application notification
    try {
      await this.notificationService.sendLoanApplicationNotification(userId, {
        id: loan.id,
        amount: parseFloat(amount.toString()),
        purpose,
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send loan application notification: ${error.message}`);
    }

    this.logger.log(
      `Loan application submitted for user ${userId}, loan ID: ${loan.id}`,
    );

    return ResponseMapper.mapLoanToResponseDto(loan);
  }

  /**
   * Get user's loans
   */
  async getUserLoans(userId: string): Promise<LoanResponseDto[]> {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    // Always return an array, never throw for empty
    return ResponseMapper.mapArrayToResponseDto(
      loans,
      ResponseMapper.mapLoanToResponseDto,
    );
  }

  /**
   * Get loan by ID (user can only see their own loans)
   */
  async getLoanById(userId: string, loanId: string): Promise<LoanResponseDto> {
    const loan = await this.prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return ResponseMapper.mapLoanToResponseDto(loan);
  }

  /**
   * Get all loans (admin only)
   */
  async getAllLoans(
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<{
    loans: LoanResponseDto[];
    pagination: { page: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as LoanStatus } : {};

    const [loans, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loan.count({ where }),
    ]);

    return {
      loans: ResponseMapper.mapArrayToResponseDto(
        loans,
        ResponseMapper.mapLoanToResponseDto,
      ),
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve loan (admin only)
   */
  async approveLoan(
    adminId: string,
    loanId: string,
    approvedAmount?: number,
  ): Promise<LoanResponseDto> {
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
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== 'PENDING') {
      throw new BadRequestException('Loan is not in pending status');
    }

    // Calculate new terms if amount changed
    const finalAmount = approvedAmount || parseFloat(loan.amount.toString());
    const loanTerms =
      approvedAmount && approvedAmount !== parseFloat(loan.amount.toString())
        ? LoanCalculatorUtil.calculateLoanTerms(
            approvedAmount,
            loan.term,
            parseFloat(loan.interestRate.toString()),
          )
        : null;

    // Update loan with approval details
    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        approvedBy: adminId,
        amount: finalAmount,
        ...(loanTerms && {
          monthlyPayment: loanTerms.monthlyPayment,
          totalAmount: loanTerms.totalAmount,
        }),
      },
    });

    // Send loan approved notification
    try {
      await this.notificationService.sendLoanApprovedNotification(loan.userId, {
        id: loan.id,
        amount: parseFloat(loan.amount.toString()),
        approvedAmount: finalAmount,
        user: {
          email: loan.user.email,
          firstName: loan.user.firstName,
          lastName: loan.user.lastName,
      },
    });
    } catch (error) {
      this.logger.error(`Failed to send loan approved notification: ${error.message}`);
    }

    return ResponseMapper.mapLoanToResponseDto(updatedLoan);
  }

  /**
   * Reject loan (admin only)
   */
  async rejectLoan(
    adminId: string,
    loanId: string,
    reason: string,
  ): Promise<LoanResponseDto> {
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
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== 'PENDING') {
      throw new BadRequestException('Loan is not in pending status');
    }

    // Update loan with rejection details
    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason,
      },
    });

    // Send loan rejected notification
    try {
      await this.notificationService.sendLoanRejectedNotification(loan.userId, {
        id: loan.id,
        amount: parseFloat(loan.amount.toString()),
        reason,
        user: {
          email: loan.user.email,
          firstName: loan.user.firstName,
          lastName: loan.user.lastName,
      },
    });
    } catch (error) {
      this.logger.error(`Failed to send loan rejected notification: ${error.message}`);
    }

    return ResponseMapper.mapLoanToResponseDto(updatedLoan);
  }

  /**
   * Disburse loan (admin only)
   */
  async disburseLoan(
    adminId: string,
    loanId: string,
  ): Promise<LoanResponseDto> {
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        user: {
          include: {
            virtualAccount: true,
          },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Loan must be active before disbursement',
      );
    }

    // Use transaction to ensure data consistency
    const updatedLoan = await this.prisma.$transaction(async (prisma) => {
      // Update loan status
      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: 'DISBURSED',
          disbursedAt: new Date(),
          dueDate: new Date(Date.now() + loan.term * 30 * 24 * 60 * 60 * 1000), // Add term months
        },
      });

      // Credit user's virtual account
      if (loan.user.virtualAccount) {
        await prisma.virtualAccount.update({
          where: { id: loan.user.virtualAccount.id },
          data: {
            balance: {
              increment: loan.amount,
            },
          },
        });
      }

      return updatedLoan;
    });

    // Send loan disbursed notification
    try {
      await this.notificationService.sendLoanDisbursedNotification(loan.userId, {
        id: loan.id,
        amount: parseFloat(loan.amount.toString()),
        accountNumber: loan.user.virtualAccount?.accountNumber || 'N/A',
        user: {
          email: loan.user.email,
          firstName: loan.user.firstName,
          lastName: loan.user.lastName,
      },
    });
    } catch (error) {
      this.logger.error(`Failed to send loan disbursed notification: ${error.message}`);
    }

    return ResponseMapper.mapLoanToResponseDto(updatedLoan);
  }

  /**
   * Get loan statistics for dashboard
   */
  async getLoanStatistics(): Promise<{
    totalLoans: number;
    totalAmount: number;
    approvedLoans: number;
    rejectedLoans: number;
    pendingLoans: number;
    activeLoans: number;
    averageLoanAmount: number;
  }> {
    const [
      totalLoans,
      totalAmount,
      approvedLoans,
      rejectedLoans,
      pendingLoans,
      activeLoans,
    ] = await Promise.all([
      this.prisma.loan.count(),
      this.prisma.loan.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
      this.prisma.loan.count({ where: { status: 'REJECTED' } }),
      this.prisma.loan.count({ where: { status: 'PENDING' } }),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
    ]);

    const averageLoanAmount =
      totalLoans > 0
        ? parseFloat(totalAmount._sum.amount?.toString() || '0') / totalLoans
        : 0;

    return {
      totalLoans,
      totalAmount: parseFloat(totalAmount._sum.amount?.toString() || '0'),
      approvedLoans,
      rejectedLoans,
      pendingLoans,
      activeLoans,
      averageLoanAmount,
    };
  }

  /**
   * Export loans to CSV
   */
  async exportLoansToCSV(): Promise<string> {
    const loans = await this.prisma.loan.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
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
      'Amount',
      'Purpose',
      'Term',
      'Interest Rate',
      'Monthly Payment',
      'Total Amount',
      'Status',
      'Score',
      'Created At',
    ].join(',');

    // Create CSV rows
    const csvRows = loans.map((loan) =>
      [
        loan.id,
        `${loan.user.firstName} ${loan.user.lastName}`,
        loan.user.email,
        loan.amount.toString(),
        `"${loan.purpose}"`,
        loan.term.toString(),
        loan.interestRate.toString(),
        loan.monthlyPayment.toString(),
        loan.totalAmount.toString(),
        loan.status,
        loan.score?.toString() || '',
        loan.createdAt.toISOString(),
      ].join(','),
    );

    return [csvHeader, ...csvRows].join('\n');
  }

  /**
   * Get user's loan applications (for now, same as getUserLoans)
   */
  async getUserLoanApplications(userId: string): Promise<LoanResponseDto[]> {
    // Always return an array, never throw for empty
    return this.getUserLoans(userId);
  }

  /**
   * Get user loan statistics for dashboard
   */
  async getUserLoanStats(userId: string): Promise<{
    totalLoans: number;
    activeLoans: number;
    pendingLoans: number;
    totalBorrowed: number;
    totalRepaid: number;
    outstandingBalance: number;
    nextPaymentAmount: number;
    nextPaymentDate: string | null;
  }> {
    // Fetch all loans for the user
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'ACTIVE').length;
    const pendingLoans = loans.filter(l => l.status === 'PENDING').length;
    const totalBorrowed = loans
      .filter(l => ['ACTIVE', 'COMPLETED'].includes(l.status))
      .reduce((sum, l) => sum + Number(l.amount), 0);
    const totalRepaid = loans.reduce((sum, l) => {
      const paid = l.payments?.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0) || 0;
      return sum + paid;
    }, 0);
    const outstandingBalance = loans
      .filter(l => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + (Number(l.totalAmount) - (l.payments?.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + Number(p.amount), 0) || 0)), 0);

    // No dueDate field on payments, so set next payment info to null/0
    const nextPaymentAmount = 0;
    const nextPaymentDate: string | null = null;

    return {
      totalLoans,
      activeLoans,
      pendingLoans,
      totalBorrowed,
      totalRepaid,
      outstandingBalance,
      nextPaymentAmount,
      nextPaymentDate,
    };
  }
}
