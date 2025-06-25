export class LoanCalculatorUtil {
  /**
   * Calculate loan terms based on amount, term, and interest rate
   */
  static calculateLoanTerms(
    amount: number,
    term: number,
    interestRate: number = 0.15,
  ): {
    monthlyPayment: number;
    totalAmount: number;
    totalInterest: number;
    interestRate: number;
  } {
    const monthlyInterestRate = interestRate / 12;
    const monthlyPayment =
      (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) /
      (Math.pow(1 + monthlyInterestRate, term) - 1);
    const totalAmount = monthlyPayment * term;
    const totalInterest = totalAmount - amount;

    return {
      monthlyPayment,
      totalAmount,
      totalInterest,
      interestRate,
    };
  }

  /**
   * Calculate remaining balance after payments
   */
  static calculateRemainingBalance(
    totalAmount: number,
    totalPaid: number,
  ): number {
    return Math.max(0, totalAmount - totalPaid);
  }

  /**
   * Calculate payment progress percentage
   */
  static calculatePaymentProgress(
    totalAmount: number,
    totalPaid: number,
  ): number {
    if (totalAmount === 0) return 0;
    return Math.min(100, (totalPaid / totalAmount) * 100);
  }

  /**
   * Calculate next payment due date
   */
  static calculateNextPaymentDate(
    disbursementDate: Date,
    term: number,
    paymentsMade: number,
  ): Date {
    const nextPaymentMonth = new Date(disbursementDate);
    nextPaymentMonth.setMonth(nextPaymentMonth.getMonth() + paymentsMade + 1);
    return nextPaymentMonth;
  }

  /**
   * Calculate late fee
   */
  static calculateLateFee(
    overdueAmount: number,
    daysOverdue: number,
    lateFeeRate: number = 0.05, // 5% per month
  ): number {
    const monthsOverdue = daysOverdue / 30;
    return overdueAmount * lateFeeRate * monthsOverdue;
  }

  /**
   * Calculate early repayment discount
   */
  static calculateEarlyRepaymentDiscount(
    remainingAmount: number,
    monthsRemaining: number,
    discountRate: number = 0.02, // 2% discount
  ): number {
    if (monthsRemaining <= 0) return 0;
    return remainingAmount * discountRate;
  }
}
