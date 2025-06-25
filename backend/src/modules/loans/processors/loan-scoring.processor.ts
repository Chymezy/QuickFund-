import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface LoanScoringJob {
  loanId: string;
  userId: string;
  amount: number;
  income: number;
  employmentStatus: string;
  loanHistory: any[];
  paymentHistory: any[];
}

@Processor('loan-scoring')
export class LoanScoringProcessor {
  private readonly logger = new Logger(LoanScoringProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('score-loan')
  async handleLoanScoring(job: Job<LoanScoringJob>) {
    this.logger.log(`Processing loan scoring for loan ID: ${job.data.loanId}`);

    try {
      // Add a delay for demo purposes
      await new Promise(res => setTimeout(res, 3000));
      const {
        loanId,
        amount,
        income,
        employmentStatus,
        loanHistory,
        paymentHistory,
      } = job.data;

      // Calculate score based on business rules
      let score = 0;

      // Income scoring (0-300 points)
      if (income >= 100000) score += 300;
      else if (income >= 75000) score += 250;
      else if (income >= 50000) score += 200;
      else if (income >= 30000) score += 150;
      else if (income >= 20000) score += 100;
      else score += 50;

      // Employment status scoring (0-200 points)
      if (employmentStatus === 'EMPLOYED') score += 200;
      else if (employmentStatus === 'SELF_EMPLOYED') score += 150;
      else if (employmentStatus === 'CONTRACT') score += 100;
      else if (employmentStatus === 'STUDENT') score += 80;
      else score += 30;

      // Loan amount scoring (0-200 points)
      const incomeToLoanRatio = amount / income;
      if (incomeToLoanRatio <= 0.1) score += 200;
      else if (incomeToLoanRatio <= 0.2) score += 150;
      else if (incomeToLoanRatio <= 0.3) score += 100;
      else if (incomeToLoanRatio <= 0.5) score += 50;
      else score += 20;

      // Payment history scoring (0-200 points)
      const onTimePayments = paymentHistory.filter(
        (p) => p.status === 'COMPLETED',
      ).length;
      const totalPayments = paymentHistory.length;
      const paymentRate =
        totalPayments > 0 ? onTimePayments / totalPayments : 0;

      if (paymentRate >= 0.95) score += 200;
      else if (paymentRate >= 0.9) score += 150;
      else if (paymentRate >= 0.8) score += 100;
      else if (paymentRate >= 0.7) score += 50;
      else score += 20;

      // Loan history scoring (0-100 points)
      const previousLoans = loanHistory.length;
      const completedLoans = loanHistory.filter(
        (l) => l.status === 'COMPLETED',
      ).length;

      if (previousLoans === 0)
        score += 50; // First-time borrower
      else if (completedLoans / previousLoans >= 0.8) score += 100;
      else if (completedLoans / previousLoans >= 0.6) score += 75;
      else if (completedLoans / previousLoans >= 0.4) score += 50;
      else score += 25;

      // Cap score at 1000
      score = Math.min(score, 1000);

      // Always leave applications in PENDING status for admin review
      // Don't automatically reject based on score - let admins make the decision
      const status = 'PENDING';

      // Update loan with scoring results
      await this.prisma.loan.update({
        where: { id: loanId },
        data: {
          score,
          status,
          approvedAt: null,
          rejectedAt: null, // Don't set rejectedAt since we're not auto-rejecting
        },
      });

      this.logger.log(`Loan ${loanId} scored: ${score}, Status: ${status} (awaiting admin review)`);

      return { score, status, isApproved: false }; // Always false since admin needs to review
    } catch (error) {
      this.logger.error(
        `Error processing loan scoring for loan ${job.data.loanId}:`,
        error,
      );
      throw error;
    }
  }
}
