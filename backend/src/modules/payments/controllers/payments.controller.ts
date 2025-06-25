import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Version,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  RequirePaymentManagement,
  RequireReportsAccess,
} from '../../../common/decorators/roles.decorator';
import { PaymentsService } from '../services/payments.service';
import { VirtualAccountService } from '../services/virtual-account.service';
import { MakePaymentDto } from '../dto/make-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly virtualAccountService: VirtualAccountService,
  ) {}

  @Post('repay')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Make loan repayment',
    description: 'Make a loan repayment using card or virtual account',
  })
  @ApiBody({
    type: MakePaymentDto,
    description: 'Payment details',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or insufficient balance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Loan not found',
  })
  async makePayment(
    @Body() makePaymentDto: MakePaymentDto,
    @Request() req,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.makePayment(req.user.id, makePaymentDto);
  }

  @Get('history')
  @Version('1')
  @ApiOperation({
    summary: 'Get payment history',
    description: 'Retrieve payment history for the authenticated user',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Payment history retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPaymentHistory(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req,
  ) {
    return this.paymentsService.getUserPayments(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({
    summary: 'Get payment details',
    description: 'Retrieve detailed information about a specific payment',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Payment not found',
  })
  async getPaymentById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(req.user.id, id);
  }

  @Get('loan/:loanId/summary')
  @Version('1')
  @ApiOperation({
    summary: 'Get loan payment summary',
    description: 'Retrieve payment summary for a specific loan',
  })
  @ApiParam({ name: 'loanId', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan payment summary retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Loan not found',
  })
  async getLoanPaymentSummary(@Param('loanId') loanId: string) {
    return this.paymentsService.getLoanPaymentSummary(loanId);
  }

  @Get('loan/:loanId/payments')
  @Version('1')
  @ApiOperation({
    summary: 'Get loan payment history',
    description: 'Retrieve payment history for a specific loan',
  })
  @ApiParam({ name: 'loanId', description: 'Loan ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiResponse({
    status: 200,
    description: 'Loan payment history retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Loan not found',
  })
  async getLoanPaymentHistory(
    @Param('loanId') loanId: string,
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.getLoanPaymentHistory(
      req.user.id,
      loanId,
      Number(page),
      Number(limit),
      status,
    );
  }

  // Virtual Account endpoints
  @Get('virtual-account/balance')
  @Version('1')
  @ApiOperation({
    summary: 'Get virtual account balance',
    description: 'Retrieve current balance of user virtual account',
  })
  @ApiResponse({
    status: 200,
    description: 'Virtual account balance retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Virtual account not found',
  })
  async getVirtualAccountBalance(@Request() req) {
    const balance = await this.virtualAccountService.getAccountBalance(
      req.user.id,
    );
    return { balance };
  }

  @Get('virtual-account/details')
  @Version('1')
  @ApiOperation({
    summary: 'Get virtual account details',
    description: 'Retrieve virtual account information',
  })
  @ApiResponse({
    status: 200,
    description: 'Virtual account details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Virtual account not found',
  })
  async getVirtualAccountDetails(@Request() req) {
    return this.virtualAccountService.getUserVirtualAccount(req.user.id);
  }

  @Get('virtual-account/transactions')
  @Version('1')
  @ApiOperation({
    summary: 'Get virtual account transactions',
    description: 'Retrieve transaction history for virtual account',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Virtual account transactions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getVirtualAccountTransactions(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req,
  ) {
    return this.virtualAccountService.getTransactionHistory(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }

  // Admin endpoints
  @Get('admin/all')
  @Version('1')
  @RequirePaymentManagement()
  @ApiOperation({
    summary: 'Get all payments (Admin)',
    description:
      'Retrieve all payments with filtering and pagination (Admin only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by payment status',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'All payments retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getAllPayments(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.paymentsService.getAllPayments(
      status,
      Number(page),
      Number(limit),
    );
  }

  @Get('admin/statistics')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Get payment statistics (Admin)',
    description: 'Retrieve payment statistics for dashboard (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getPaymentStatistics() {
    return this.paymentsService.getPaymentStatistics();
  }

  @Get('admin/export/csv')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Export payments to CSV (Admin)',
    description: 'Export all payments data to CSV format (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async exportPaymentsToCSV(@Res() res: Response) {
    const csvData = await this.paymentsService.exportPaymentsToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=payments-export.csv',
    );
    res.send(csvData);
  }

  // Virtual Account Admin endpoints
  @Post('admin/virtual-account/:userId/credit')
  @Version('1')
  @RequirePaymentManagement()
  @ApiOperation({
    summary: 'Credit virtual account (Admin)',
    description: 'Credit a user virtual account (Admin only)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount', 'reference'],
      properties: {
        amount: {
          type: 'number',
          description: 'Amount to credit',
        },
        reference: {
          type: 'string',
          description: 'Transaction reference',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Virtual account credited successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Virtual account not found',
  })
  async creditVirtualAccount(
    @Param('userId') userId: string,
    @Body() body: { amount: number; reference: string },
  ) {
    return this.virtualAccountService.creditAccount(
      userId,
      body.amount,
      body.reference,
    );
  }

  @Post('admin/virtual-account/:userId/debit')
  @Version('1')
  @RequirePaymentManagement()
  @ApiOperation({
    summary: 'Debit virtual account (Admin)',
    description: 'Debit a user virtual account (Admin only)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount', 'reference'],
      properties: {
        amount: {
          type: 'number',
          description: 'Amount to debit',
        },
        reference: {
          type: 'string',
          description: 'Transaction reference',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Virtual account debited successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or insufficient balance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Virtual account not found',
  })
  async debitVirtualAccount(
    @Param('userId') userId: string,
    @Body() body: { amount: number; reference: string },
  ) {
    return this.virtualAccountService.debitAccount(
      userId,
      body.amount,
      body.reference,
    );
  }

  @Get('admin/virtual-account/:accountNumber')
  @Version('1')
  @RequirePaymentManagement()
  @ApiOperation({
    summary: 'Get account by number (Admin)',
    description:
      'Retrieve virtual account details by account number (Admin only)',
  })
  @ApiParam({ name: 'accountNumber', description: 'Account number' })
  @ApiResponse({
    status: 200,
    description: 'Account details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Account not found',
  })
  async getAccountByNumber(@Param('accountNumber') accountNumber: string) {
    return this.virtualAccountService.getAccountByNumber(accountNumber);
  }
}
