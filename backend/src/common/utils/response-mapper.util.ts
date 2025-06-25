import { LoanResponseDto } from '../../modules/loans/dto/loan-response.dto';
import { PaymentResponseDto } from '../../modules/payments/dto/payment-response.dto';

export class ResponseMapper {
  /**
   * Generic mapper for converting Prisma entities to response DTOs
   */
  static mapToResponseDto<T>(entity: any, mapper: (entity: any) => T): T {
    return mapper(entity);
  }

  /**
   * Map loan entity to LoanResponseDto
   */
  static mapLoanToResponseDto(loan: any): LoanResponseDto {
    // Calculate remaining balance if payments exist
    let remainingBalance = parseFloat(loan.totalAmount.toString());
    if (loan.payments && loan.payments.length > 0) {
      const totalPaid = loan.payments
        .filter((p: any) => p.status === 'COMPLETED')
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount.toString()), 0);
      remainingBalance = Math.max(0, remainingBalance - totalPaid);
    }

    return {
      id: loan.id,
      userId: loan.userId,
      amount: parseFloat(loan.amount.toString()),
      purpose: loan.purpose,
      term: loan.term,
      interestRate: parseFloat(loan.interestRate.toString()),
      monthlyPayment: parseFloat(loan.monthlyPayment.toString()),
      totalAmount: parseFloat(loan.totalAmount.toString()),
      status: loan.status,
      score: loan.score,
      approvedAt: loan.approvedAt,
      approvedBy: loan.approvedBy,
      rejectedAt: loan.rejectedAt,
      rejectedBy: loan.rejectedBy,
      rejectionReason: loan.rejectionReason,
      disbursedAt: loan.disbursedAt,
      dueDate: loan.dueDate,
      remainingBalance,
      nextPaymentDate: loan.nextPaymentDate,
      paymentHistory: loan.payments ? loan.payments.map((p: any) => this.mapPaymentToResponseDto(p)) : [],
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    };
  }

  /**
   * Map payment entity to PaymentResponseDto
   */
  static mapPaymentToResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      loanId: payment.loanId,
      amount: parseFloat(payment.amount.toString()),
      type: payment.type,
      status: payment.status,
      reference: payment.reference,
      gateway: payment.gateway,
      gatewayRef: payment.gatewayRef,
      processedAt: payment.processedAt,
      dueDate: payment.dueDate || payment.createdAt,
      paidAt: payment.paidAt || payment.processedAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      loan: payment.loan
        ? {
            id: payment.loan.id,
            user: payment.loan.user
              ? {
                  id: payment.loan.user.id,
                  firstName: payment.loan.user.firstName,
                  lastName: payment.loan.user.lastName,
                  email: payment.loan.user.email,
                }
              : undefined,
          }
        : undefined,
    };
  }

  /**
   * Map array of entities to response DTOs
   */
  static mapArrayToResponseDto<T>(
    entities: any[],
    mapper: (entity: any) => T,
  ): T[] {
    return entities.map((entity) => mapper(entity));
  }
}
