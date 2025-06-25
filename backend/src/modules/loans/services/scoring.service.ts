import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EmploymentStatus } from '@prisma/client';

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate credit score based on user profile and loan application
   * Score range: 0-1000
   */
  async calculateCreditScore(
    userId: string,
    loanAmount: number,
    term: number,
  ): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        loans: {
          where: {
            status: { in: ['COMPLETED', 'DEFAULTED'] },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get payment history separately
    const payments = await this.prisma.payment.findMany({
      where: {
        loan: {
          userId: userId,
        },
      },
      include: {
        loan: true,
      },
    });

    let score = 0;

    // Base score for verified users
    if (user.isVerified) {
      score += 100;
    }

    // Employment status scoring
    score += this.getEmploymentScore(user.employmentStatus);

    // Monthly income scoring
    if (user.monthlyIncome) {
      score += this.getIncomeScore(parseFloat(user.monthlyIncome.toString()));
    }

    // Loan history scoring
    score += this.getLoanHistoryScore(user.loans);

    // Payment history scoring
    score += this.getPaymentHistoryScore(payments);

    // Loan amount and term scoring
    score += this.getLoanAmountScore(loanAmount, term);

    // Profile completeness scoring
    score += this.getProfileCompletenessScore(user);

    // Ensure score is within bounds
    return Math.max(0, Math.min(1000, score));
  }

  private getEmploymentScore(
    employmentStatus: EmploymentStatus | null,
  ): number {
    switch (employmentStatus) {
      case 'EMPLOYED':
        return 200;
      case 'SELF_EMPLOYED':
        return 150;
      case 'STUDENT':
        return 50;
      case 'RETIRED':
        return 100;
      case 'UNEMPLOYED':
        return 0;
      default:
        return 0;
    }
  }

  private getIncomeScore(monthlyIncome: number): number {
    if (monthlyIncome >= 500000) return 200;
    if (monthlyIncome >= 300000) return 150;
    if (monthlyIncome >= 200000) return 120;
    if (monthlyIncome >= 100000) return 100;
    if (monthlyIncome >= 50000) return 80;
    return 0;
  }

  private getLoanHistoryScore(loans: any[]): number {
    if (loans.length === 0) return 50; // First-time borrower bonus

    const completedLoans = loans.filter((loan) => loan.status === 'COMPLETED');
    const defaultedLoans = loans.filter((loan) => loan.status === 'DEFAULTED');

    let score = 0;

    // Bonus for completed loans
    score += completedLoans.length * 50;

    // Penalty for defaulted loans
    score -= defaultedLoans.length * 200;

    return score;
  }

  private getPaymentHistoryScore(payments: any[]): number {
    if (payments.length === 0) return 0;

    const completedPayments = payments.filter(
      (payment) => payment.status === 'COMPLETED',
    );
    const failedPayments = payments.filter(
      (payment) => payment.status === 'FAILED',
    );

    const totalPayments = payments.length;
    const successRate = completedPayments.length / totalPayments;

    let score = 0;

    if (successRate >= 0.95) score += 150;
    else if (successRate >= 0.9) score += 100;
    else if (successRate >= 0.8) score += 50;
    else score += 0;

    // Penalty for failed payments
    score -= failedPayments.length * 20;

    return score;
  }

  private getLoanAmountScore(amount: number, term: number): number {
    let score = 0;

    // Amount scoring (prefer moderate amounts)
    if (amount <= 50000) score += 100;
    else if (amount <= 100000) score += 80;
    else if (amount <= 200000) score += 60;
    else if (amount <= 500000) score += 40;
    else score += 20;

    // Term scoring (prefer shorter terms)
    if (term <= 6) score += 100;
    else if (term <= 12) score += 80;
    else if (term <= 24) score += 60;
    else if (term <= 36) score += 40;
    else score += 20;

    return score;
  }

  private getProfileCompletenessScore(user: any): number {
    let score = 0;

    if (user.phone) score += 20;
    if (user.address) score += 20;
    if (user.city) score += 20;
    if (user.state) score += 20;
    if (user.employerName) score += 20;
    if (user.monthlyIncome) score += 20;

    return score;
  }

  /**
   * Determine loan approval based on credit score and other factors
   */
  async shouldApproveLoan(
    score: number,
    amount: number,
    term: number,
  ): Promise<{
    approved: boolean;
    reason: string;
    suggestedAmount?: number;
    suggestedTerm?: number;
  }> {
    // Minimum score requirement
    if (score < 600) {
      return {
        approved: false,
        reason: 'Credit score too low. Minimum required: 600',
      };
    }

    // High-risk loan amount
    if (amount > 500000 && score < 750) {
      return {
        approved: false,
        reason: 'High loan amount requires higher credit score',
      };
    }

    // Long-term loan with low score
    if (term > 24 && score < 700) {
      return {
        approved: false,
        reason: 'Long-term loans require higher credit score',
      };
    }

    // Suggest adjustments for borderline cases
    if (score >= 600 && score < 650) {
      if (amount > 200000) {
        return {
          approved: false,
          reason: 'Consider reducing loan amount for better approval chances',
          suggestedAmount: 150000,
        };
      }
      if (term > 12) {
        return {
          approved: false,
          reason: 'Consider shorter loan term for better approval chances',
          suggestedTerm: 12,
        };
      }
    }

    return {
      approved: true,
      reason: 'Loan application meets approval criteria',
    };
  }

  /**
   * Calculate loan terms (interest rate, monthly payment, total amount)
   */
  calculateLoanTerms(
    amount: number,
    term: number,
    score: number,
  ): {
    interestRate: number;
    monthlyPayment: number;
    totalAmount: number;
  } {
    // Base interest rate based on credit score
    let baseRate = 0.15; // 15% base rate

    if (score >= 800)
      baseRate = 0.1; // 10% for excellent credit
    else if (score >= 700)
      baseRate = 0.12; // 12% for good credit
    else if (score >= 600)
      baseRate = 0.15; // 15% for fair credit
    else baseRate = 0.2; // 20% for poor credit

    // Adjust rate based on loan amount
    if (amount > 500000) baseRate += 0.02; // Higher rate for large loans
    if (amount < 50000) baseRate -= 0.01; // Lower rate for small loans

    // Adjust rate based on term
    if (term > 24) baseRate += 0.01; // Higher rate for longer terms

    // Calculate monthly payment using loan amortization formula
    const monthlyRate = baseRate / 12;
    const totalAmount = amount * Math.pow(1 + baseRate, term / 12);
    const monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);

    return {
      interestRate: baseRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}
