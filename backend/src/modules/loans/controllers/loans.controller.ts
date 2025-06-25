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
  RequireLoanManagement,
  RequireLoanApproval,
  RequireReportsAccess,
} from '../../../common/decorators/roles.decorator';
import { LoansService } from '../services/loans.service';
import { ApplyLoanDto } from '../dto/apply-loan.dto';
import { LoanResponseDto } from '../dto/loan-response.dto';

@ApiTags('Loans')
@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('apply')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Apply for a loan',
    description:
      'Submit a new loan application with automatic scoring and approval process',
  })
  @ApiBody({
    type: ApplyLoanDto,
    description: 'Loan application details',
  })
  @ApiResponse({
    status: 201,
    description: 'Loan application submitted successfully',
    type: LoanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or user has active loans',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async applyForLoan(
    @Body() applyLoanDto: ApplyLoanDto,
    @Request() req,
  ): Promise<LoanResponseDto> {
    return this.loansService.applyForLoan(req.user.id, applyLoanDto);
  }

  @Get('my-loans')
  @Version('1')
  @ApiOperation({
    summary: 'Get user loans',
    description: 'Retrieve all loans for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User loans retrieved successfully',
    type: [LoanResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserLoans(@Request() req): Promise<LoanResponseDto[]> {
    return this.loansService.getUserLoans(req.user.id);
  }

  @Get('my-applications')
  @Version('1')
  @ApiOperation({
    summary: 'Get user loan applications',
    description: 'Retrieve all loan applications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User loan applications retrieved successfully',
    type: [LoanResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserLoanApplications(@Request() req): Promise<LoanResponseDto[]> {
    return this.loansService.getUserLoanApplications(req.user.id);
  }

  @Get('stats')
  @Version('1')
  @ApiOperation({
    summary: 'Get user loan statistics',
    description: 'Retrieve loan statistics for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User loan statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalLoans: { type: 'number' },
        activeLoans: { type: 'number' },
        pendingLoans: { type: 'number' },
        totalBorrowed: { type: 'number' },
        totalRepaid: { type: 'number' },
        outstandingBalance: { type: 'number' },
        nextPaymentAmount: { type: 'number' },
        nextPaymentDate: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getUserLoanStats(@Request() req) {
    return this.loansService.getUserLoanStats(req.user.id);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({
    summary: 'Get loan details',
    description: 'Retrieve detailed information about a specific loan',
  })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan details retrieved successfully',
    type: LoanResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Loan not found',
  })
  async getLoanById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<LoanResponseDto> {
    return this.loansService.getLoanById(req.user.id, id);
  }

  // Admin endpoints
  @Get('admin/all')
  @Version('1')
  @RequireLoanManagement()
  @ApiOperation({
    summary: 'Get all loans (Admin)',
    description:
      'Retrieve all loans with filtering and pagination (Admin only)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by loan status',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'All loans retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getAllLoans(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.loansService.getAllLoans(status, Number(page), Number(limit));
  }

  @Post('admin/:id/approve')
  @Version('1')
  @RequireLoanApproval()
  @ApiOperation({
    summary: 'Approve loan (Admin)',
    description: 'Approve a loan application (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        approvedAmount: {
          type: 'number',
          description: 'Optional approved amount (if different from requested)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Loan approved successfully',
    type: LoanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Loan is not in pending status',
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
    description: 'Not found - Loan not found',
  })
  async approveLoan(
    @Param('id') id: string,
    @Body() body: { approvedAmount?: number },
    @Request() req,
  ): Promise<LoanResponseDto> {
    return this.loansService.approveLoan(req.user.id, id, body.approvedAmount);
  }

  @Post('admin/:id/reject')
  @Version('1')
  @RequireLoanApproval()
  @ApiOperation({
    summary: 'Reject loan (Admin)',
    description: 'Reject a loan application with reason (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for rejection',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Loan rejected successfully',
    type: LoanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Loan is not in pending status',
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
    description: 'Not found - Loan not found',
  })
  async rejectLoan(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ): Promise<LoanResponseDto> {
    return this.loansService.rejectLoan(req.user.id, id, body.reason);
  }

  @Post('admin/:id/disburse')
  @Version('1')
  @RequireLoanApproval()
  @ApiOperation({
    summary: 'Disburse loan (Admin)',
    description:
      'Disburse an approved loan to user virtual account (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan disbursed successfully',
    type: LoanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Loan must be approved before disbursement',
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
    description: 'Not found - Loan not found',
  })
  async disburseLoan(
    @Param('id') id: string,
    @Request() req,
  ): Promise<LoanResponseDto> {
    return this.loansService.disburseLoan(req.user.id, id);
  }

  @Get('admin/statistics')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Get loan statistics (Admin)',
    description: 'Retrieve loan statistics for dashboard (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Loan statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getLoanStatistics() {
    return this.loansService.getLoanStatistics();
  }

  @Get('admin/export/csv')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Export loans to CSV (Admin)',
    description: 'Export all loans data to CSV format (Admin only)',
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
  async exportLoansToCSV(@Res() res: Response) {
    const csvData = await this.loansService.exportLoansToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=loans-export.csv',
    );
    res.send(csvData);
  }
}
