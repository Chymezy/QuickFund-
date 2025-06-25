import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GeneratorUtil } from '../../../common/utils/generator.util';

@Injectable()
export class VirtualAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's virtual account
   */
  async getUserVirtualAccount(userId: string) {
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { userId },
    });

    if (!virtualAccount) {
      throw new NotFoundException('Virtual account not found');
    }

    return {
      id: virtualAccount.id,
      accountNumber: virtualAccount.accountNumber,
      bankName: virtualAccount.bankName,
      balance: parseFloat(virtualAccount.balance.toString()),
      isActive: virtualAccount.isActive,
      createdAt: virtualAccount.createdAt,
      updatedAt: virtualAccount.updatedAt,
    };
  }

  /**
   * Create virtual account for user
   */
  async createVirtualAccount(userId: string) {
    // Check if user already has a virtual account
    const existingAccount = await this.prisma.virtualAccount.findUnique({
      where: { userId },
    });

    if (existingAccount) {
      throw new BadRequestException('User already has a virtual account');
    }

    // Generate unique account number using utility
    const accountNumber = GeneratorUtil.generateAccountNumber();

    const virtualAccount = await this.prisma.virtualAccount.create({
      data: {
        userId,
        accountNumber,
        bankName: 'QuickFund Bank',
        balance: 0,
        isActive: true,
      },
    });

    return {
      id: virtualAccount.id,
      accountNumber: virtualAccount.accountNumber,
      bankName: virtualAccount.bankName,
      balance: parseFloat(virtualAccount.balance.toString()),
      isActive: virtualAccount.isActive,
      createdAt: virtualAccount.createdAt,
      updatedAt: virtualAccount.updatedAt,
    };
  }

  /**
   * Credit virtual account
   */
  async creditAccount(userId: string, amount: number, reference: string) {
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { userId },
    });

    if (!virtualAccount) {
      throw new NotFoundException('Virtual account not found');
    }

    if (!virtualAccount.isActive) {
      throw new BadRequestException('Virtual account is inactive');
    }

    const updatedAccount = await this.prisma.virtualAccount.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create transaction log
    await this.prisma.payment.create({
      data: {
        loanId: 'VIRTUAL_ACCOUNT_CREDIT', // Special identifier for virtual account credits
        amount,
        type: 'LOAN_REPAYMENT',
        status: 'COMPLETED',
        reference,
        gateway: 'virtual_account',
        processedAt: new Date(),
      },
    });

    return {
      id: updatedAccount.id,
      accountNumber: updatedAccount.accountNumber,
      bankName: updatedAccount.bankName,
      balance: parseFloat(updatedAccount.balance.toString()),
      isActive: updatedAccount.isActive,
      createdAt: updatedAccount.createdAt,
      updatedAt: updatedAccount.updatedAt,
    };
  }

  /**
   * Debit virtual account
   */
  async debitAccount(userId: string, amount: number, reference: string) {
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { userId },
    });

    if (!virtualAccount) {
      throw new NotFoundException('Virtual account not found');
    }

    if (!virtualAccount.isActive) {
      throw new BadRequestException('Virtual account is inactive');
    }

    const currentBalance = parseFloat(virtualAccount.balance.toString());
    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const updatedAccount = await this.prisma.virtualAccount.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Create transaction log
    await this.prisma.payment.create({
      data: {
        loanId: 'VIRTUAL_ACCOUNT_DEBIT', // Special identifier for virtual account debits
        amount,
        type: 'LOAN_REPAYMENT',
        status: 'COMPLETED',
        reference,
        gateway: 'virtual_account',
        processedAt: new Date(),
      },
    });

    return {
      id: updatedAccount.id,
      accountNumber: updatedAccount.accountNumber,
      bankName: updatedAccount.bankName,
      balance: parseFloat(updatedAccount.balance.toString()),
      isActive: updatedAccount.isActive,
      createdAt: updatedAccount.createdAt,
      updatedAt: updatedAccount.updatedAt,
    };
  }

  /**
   * Transfer between virtual accounts
   */
  async transferBetweenAccounts(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reference: string,
  ) {
    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (prisma) => {
      // Debit from account
      const fromAccount = await prisma.virtualAccount.findUnique({
        where: { userId: fromUserId },
      });

      if (!fromAccount) {
        throw new NotFoundException('Source account not found');
      }

      if (!fromAccount.isActive) {
        throw new BadRequestException('Source account is inactive');
      }

      const fromBalance = parseFloat(fromAccount.balance.toString());
      if (fromBalance < amount) {
        throw new BadRequestException('Insufficient balance in source account');
      }

      // Credit to account
      const toAccount = await prisma.virtualAccount.findUnique({
        where: { userId: toUserId },
      });

      if (!toAccount) {
        throw new NotFoundException('Destination account not found');
      }

      if (!toAccount.isActive) {
        throw new BadRequestException('Destination account is inactive');
      }

      // Perform the transfer
      await prisma.virtualAccount.update({
        where: { userId: fromUserId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await prisma.virtualAccount.update({
        where: { userId: toUserId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create transaction logs
      await prisma.payment.createMany({
        data: [
          {
            loanId: 'VIRTUAL_ACCOUNT_TRANSFER_OUT',
            amount,
            type: 'LOAN_REPAYMENT',
            status: 'COMPLETED',
            reference: `${reference}_OUT`,
            gateway: 'virtual_account',
            processedAt: new Date(),
          },
          {
            loanId: 'VIRTUAL_ACCOUNT_TRANSFER_IN',
            amount,
            type: 'LOAN_REPAYMENT',
            status: 'COMPLETED',
            reference: `${reference}_IN`,
            gateway: 'virtual_account',
            processedAt: new Date(),
          },
        ],
      });

      return {
        success: true,
        amount,
        reference,
        fromAccount: fromUserId,
        toAccount: toUserId,
      };
    });
  }

  /**
   * Get account balance
   */
  async getAccountBalance(userId: string): Promise<number> {
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { userId },
    });

    if (!virtualAccount) {
      throw new NotFoundException('Virtual account not found');
    }

    return parseFloat(virtualAccount.balance.toString());
  }

  /**
   * Get account transaction history
   */
  async getTransactionHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: {
          OR: [
            { loanId: 'VIRTUAL_ACCOUNT_CREDIT' },
            { loanId: 'VIRTUAL_ACCOUNT_DEBIT' },
            { loanId: 'VIRTUAL_ACCOUNT_TRANSFER_OUT' },
            { loanId: 'VIRTUAL_ACCOUNT_TRANSFER_IN' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({
        where: {
          OR: [
            { loanId: 'VIRTUAL_ACCOUNT_CREDIT' },
            { loanId: 'VIRTUAL_ACCOUNT_DEBIT' },
            { loanId: 'VIRTUAL_ACCOUNT_TRANSFER_OUT' },
            { loanId: 'VIRTUAL_ACCOUNT_TRANSFER_IN' },
          ],
        },
      }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: parseFloat(tx.amount.toString()),
        type: tx.type,
        status: tx.status,
        reference: tx.reference,
        gateway: tx.gateway,
        processedAt: tx.processedAt,
        createdAt: tx.createdAt,
      })),
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Validate account number format
   */
  validateAccountNumber(accountNumber: string): boolean {
    // QuickFund account numbers should start with 'QF' and be 14 characters long
    const accountNumberRegex = /^QF\d{12}$/;
    return accountNumberRegex.test(accountNumber);
  }

  /**
   * Get account by account number
   */
  async getAccountByNumber(accountNumber: string) {
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { accountNumber },
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
    });

    if (!virtualAccount) {
      throw new NotFoundException('Account not found');
    }

    return {
      id: virtualAccount.id,
      accountNumber: virtualAccount.accountNumber,
      bankName: virtualAccount.bankName,
      balance: parseFloat(virtualAccount.balance.toString()),
      isActive: virtualAccount.isActive,
      user: virtualAccount.user,
      createdAt: virtualAccount.createdAt,
      updatedAt: virtualAccount.updatedAt,
    };
  }
}
