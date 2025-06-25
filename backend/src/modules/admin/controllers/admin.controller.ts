import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Version,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Patch,
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  Roles,
  Permissions,
  RequireAdmin,
  RequireSuperAdmin,
  RequireLoanOfficer,
  RequireFinanceManager,
  RequireComplianceOfficer,
  RequireUserManagement,
  RequireLoanManagement,
  RequireLoanApproval,
  RequirePaymentManagement,
  RequireDocumentVerification,
  RequireSystemManagement,
  RequireReportsAccess,
} from '../../../common/decorators/roles.decorator';
import { UserRole, Permission } from '../../../common/constants/roles.constant';
import { LoansService } from '../../loans/services/loans.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { LoanStatus } from '@prisma/client';
import { PaymentsService } from '../../payments/services/payments.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(
    private readonly loansService: LoansService,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // User Management Endpoints
  @Get('users')
  @Version('1')
  @RequireUserManagement()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve all users with pagination and filtering (requires user management permissions)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (active/inactive)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('role') role?: UserRole,
    @Query('status') status?: string,
  ) {
    return {
      users: [],
      pagination: { page, limit, total: 0 },
      filters: { role, status },
    };
  }

  @Get('users/:id')
  @Version('1')
  @RequireUserManagement()
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed user information by ID',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string) {
    return { id, message: 'User details' };
  }

  @Put('users/:id/status')
  @Version('1')
  @RequireComplianceOfficer()
  @ApiOperation({
    summary: 'Update user status',
    description:
      'Activate or deactivate user account (requires compliance officer role)',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean; reason?: string },
  ) {
    return { id, isActive: body.isActive, message: 'User status updated' };
  }

  // Loan Management Endpoints
  @Get('loans')
  @Version('1')
  @RequireLoanManagement()
  @ApiOperation({
    summary: 'Get all loans',
    description: 'Retrieve all loans with filtering and pagination',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by loan status',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiResponse({
    status: 200,
    description: 'Loans retrieved successfully',
  })
  async getAllLoans(@Query('status') status?: string, @Query('page') page = 1) {
    return {
      loans: [],
      pagination: { page, total: 0 },
    };
  }

  @Post('loans/:id/approve')
  @Version('1')
  @RequireLoanApproval()
  @ApiOperation({
    summary: 'Approve loan',
    description:
      'Approve a loan application (requires loan approval permissions)',
  })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan approved successfully',
  })
  async approveLoan(
    @Param('id') id: string,
    @Body() body: { approvedAmount?: number; notes?: string },
    @Request() req,
  ) {
    return {
      loanId: id,
      approvedBy: req.user.id,
      message: 'Loan approved successfully',
    };
  }

  @Post('loans/:id/reject')
  @Version('1')
  @RequireLoanApproval()
  @ApiOperation({
    summary: 'Reject loan',
    description: 'Reject a loan application with reason',
  })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan rejected successfully',
  })
  async rejectLoan(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    return {
      loanId: id,
      rejectedBy: req.user.id,
      reason: body.reason,
      message: 'Loan rejected successfully',
    };
  }

  // Payment Management Endpoints
  @Get('payments')
  @Version('1')
  @RequirePaymentManagement()
  @ApiOperation({
    summary: 'Get all payments',
    description: 'Retrieve all payments with filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
  })
  async getAllPayments(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ) {
    // Call the real payments service
    return this.paymentsService.getAllPayments(status, Number(page), Number(limit));
  }

  @Get('loans/:loanId/payments')
  @Version('1')
  @RequirePaymentManagement()
  @ApiOperation({
    summary: 'Get loan payment history (Admin)',
    description: 'Retrieve payment history for a specific loan (Admin only)',
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
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Loan not found',
  })
  async getLoanPaymentHistory(
    @Param('loanId') loanId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    // Get real payment data from the payments service
    // First check if loan exists
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
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

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Get payments for this loan
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { loanId };
    if (status) {
      where.status = status.toUpperCase();
    }

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
        take: Number(limit),
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map(payment => ({
        id: payment.id,
        loanId: payment.loanId,
        amount: Number(payment.amount),
        type: payment.type,
        status: payment.status,
        reference: payment.reference,
        gateway: payment.gateway,
        gatewayRef: payment.gatewayRef,
        processedAt: payment.processedAt,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        loan: {
          id: payment.loan.id,
          user: payment.loan.user,
        },
      })),
      pagination: {
        page: Number(page),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  @Post('payments/:id/process')
  @Version('1')
  @RequireFinanceManager()
  @ApiOperation({
    summary: 'Process payment',
    description: 'Process a payment (requires finance manager role)',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
  })
  async processPayment(@Param('id') id: string, @Request() req) {
    return {
      paymentId: id,
      processedBy: req.user.id,
      message: 'Payment processed successfully',
    };
  }

  // Document Management Endpoints
  @Get('documents')
  @Version('1')
  @RequireDocumentVerification()
  @ApiOperation({
    summary: 'Get all documents',
    description: 'Retrieve all documents for verification',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by verification status',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  async getAllDocuments(@Query('status') status?: string) {
    return { documents: [] };
  }

  @Post('documents/:id/verify')
  @Version('1')
  @RequireDocumentVerification()
  @ApiOperation({
    summary: 'Verify document',
    description: 'Verify a user document',
  })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'Document verified successfully',
  })
  async verifyDocument(
    @Param('id') id: string,
    @Body() body: { isVerified: boolean; notes?: string },
    @Request() req,
  ) {
    return {
      documentId: id,
      verifiedBy: req.user.id,
      isVerified: body.isVerified,
      message: 'Document verification updated',
    };
  }

  // System Management Endpoints
  @Get('system/config')
  @Version('1')
  @RequireSystemManagement()
  @ApiOperation({
    summary: 'Get system configuration',
    description:
      'Retrieve system configuration (requires system management permissions)',
  })
  @ApiResponse({
    status: 200,
    description: 'System configuration retrieved successfully',
  })
  async getSystemConfig() {
    return {
      config: {
        maxLoanAmount: 1000000,
        minCreditScore: 600,
        interestRate: 0.15,
        processingFee: 5000,
      },
    };
  }

  @Put('system/config')
  @Version('1')
  @RequireSystemManagement()
  @ApiOperation({
    summary: 'Update system configuration',
    description: 'Update system configuration parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'System configuration updated successfully',
  })
  async updateSystemConfig(@Body() config: any, @Request() req) {
    return {
      updatedBy: req.user.id,
      config,
      message: 'System configuration updated successfully',
    };
  }

  // Reports & Analytics Endpoints
  @Get('reports/loans')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Get loan reports',
    description: 'Generate loan reports and analytics',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Report period (daily/weekly/monthly)',
  })
  @ApiResponse({
    status: 200,
    description: 'Loan reports generated successfully',
  })
  async getLoanReports(@Query('period') period = 'monthly') {
    return {
      period,
      totalLoans: 0,
      totalAmount: 0,
      approvedLoans: 0,
      rejectedLoans: 0,
      averageLoanAmount: 0,
    };
  }

  @Get('reports/users')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Get user reports',
    description: 'Generate user analytics and reports',
  })
  @ApiResponse({
    status: 200,
    description: 'User reports generated successfully',
  })
  async getUserReports() {
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      verifiedUsers: 0,
      userGrowth: [],
    };
  }

  // Admin Management Endpoints
  @Get('admins')
  @Version('1')
  @RequireSuperAdmin()
  @ApiOperation({
    summary: 'Get all admins',
    description: 'Retrieve all admin users (super admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Admins retrieved successfully',
  })
  async getAllAdmins() {
    return { admins: [] };
  }

  @Post('admins')
  @Version('1')
  @RequireSuperAdmin()
  @ApiOperation({
    summary: 'Create admin',
    description: 'Create a new admin user (super admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
  })
  async createAdmin(@Body() adminData: any, @Request() req) {
    return {
      createdBy: req.user.id,
      admin: adminData,
      message: 'Admin created successfully',
    };
  }

  @Delete('admins/:id')
  @Version('1')
  @RequireSuperAdmin()
  @ApiOperation({
    summary: 'Delete admin',
    description: 'Delete an admin user (super admin only)',
  })
  @ApiParam({ name: 'id', description: 'Admin ID' })
  @ApiResponse({
    status: 200,
    description: 'Admin deleted successfully',
  })
  async deleteAdmin(@Param('id') id: string, @Request() req) {
    return {
      deletedBy: req.user.id,
      adminId: id,
      message: 'Admin deleted successfully',
    };
  }

  // Dashboard Statistics Endpoint
  @Get('stats')
  @Version('1')
  @RequireReportsAccess()
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description: 'Retrieve statistics for admin dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats() {
    // Get real statistics from database
    const [
      totalUsers,
      totalLoans,
      pendingLoans,
      activeLoans,
      completedLoans,
      totalPayments,
      totalAmount
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.loan.count(),
      this.prisma.loan.count({ where: { status: 'PENDING' } }),
      this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
      this.prisma.loan.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count(),
      this.prisma.loan.aggregate({
        where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
        _sum: { amount: true }
      })
    ]);

    // Calculate monthly revenue (simplified - in production would be more complex)
    const totalAmountValue = totalAmount._sum.amount ? Number(totalAmount._sum.amount) : 0;
    const monthlyRevenue = totalAmountValue * 0.15 / 12;

    return {
      totalUsers,
      totalLoans,
      totalAmount: totalAmount._sum.amount || 0,
      pendingApplications: pendingLoans,
      activeLoans,
      completedLoans,
      totalPayments,
      monthlyRevenue
    };
  }

  // Loan Applications Endpoint
  @Get('applications')
  @Version('1')
  @RequireLoanManagement()
  @ApiOperation({
    summary: 'Get all loan applications',
    description: 'Retrieve all loan applications with filtering and pagination',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by application status',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  async getApplications(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    // Get real loan applications from database
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status: status.toUpperCase() as LoanStatus } : {};

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
              phone: true,
              monthlyIncome: true,
              employmentStatus: true,
              employerName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.loan.count({ where }),
    ]);

    // Transform loans to match expected format
    const applications = loans.map(loan => ({
      id: loan.id,
      userId: loan.userId,
      user: {
        id: loan.user.id,
        firstName: loan.user.firstName,
        lastName: loan.user.lastName,
        email: loan.user.email,
        phone: loan.user.phone,
      },
      amount: Number(loan.amount),
      purpose: loan.purpose,
      term: loan.term,
      status: loan.status,
      monthlyIncome: loan.user.monthlyIncome ? Number(loan.user.monthlyIncome) : null,
      employmentStatus: loan.user.employmentStatus,
      employerName: loan.user.employerName,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
    }));

    return {
      applications,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }

  @Get('applications/:id')
  @Version('1')
  @RequireLoanManagement()
  @ApiOperation({
    summary: 'Get loan application by ID',
    description: 'Retrieve a specific loan application by ID',
  })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found',
  })
  async getApplication(@Param('id') id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            monthlyIncome: true,
            employmentStatus: true,
            employerName: true,
            dateOfBirth: true,
            address: true,
          },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('Application not found');
    }

    return {
      id: loan.id,
      userId: loan.userId,
      user: {
        id: loan.user.id,
        firstName: loan.user.firstName,
        lastName: loan.user.lastName,
        email: loan.user.email,
        phone: loan.user.phone,
        dateOfBirth: loan.user.dateOfBirth,
        address: loan.user.address,
      },
      amount: Number(loan.amount),
      purpose: loan.purpose,
      term: loan.term,
      status: loan.status,
      monthlyIncome: loan.user.monthlyIncome ? Number(loan.user.monthlyIncome) : null,
      employmentStatus: loan.user.employmentStatus,
      employerName: loan.user.employerName,
      interestRate: Number(loan.interestRate),
      monthlyPayment: Number(loan.monthlyPayment),
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
    };
  }

  @Patch('applications/:id')
  @Version('1')
  @RequireLoanApproval()
  @ApiOperation({
    summary: 'Update application status',
    description: 'Approve or reject a loan application',
  })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['APPROVED', 'REJECTED'],
          description: 'New status for the application',
        },
        notes: {
          type: 'string',
          description: 'Optional notes or rejection reason',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; notes?: string },
  ) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!loan) {
      throw new NotFoundException('Application not found');
    }

    if (loan.status !== 'PENDING') {
      throw new BadRequestException('Only pending applications can be updated');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status === 'APPROVED') {
      // Set status to ACTIVE so the loan is immediately active and counts towards total borrowed
      updateData.status = 'ACTIVE';
      updateData.approvedAt = new Date();
      updateData.approvedBy = 'admin'; // In real app, this would be the admin ID
    } else if (body.status === 'REJECTED') {
      updateData.status = 'REJECTED';
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = 'admin'; // In real app, this would be the admin ID
      updateData.rejectionReason = body.notes;
    }

    const updatedLoan = await this.prisma.loan.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            monthlyIncome: true,
            employmentStatus: true,
            employerName: true,
          },
        },
      },
    });

    return {
      id: updatedLoan.id,
      userId: updatedLoan.userId,
      user: {
        id: updatedLoan.user.id,
        firstName: updatedLoan.user.firstName,
        lastName: updatedLoan.user.lastName,
        email: updatedLoan.user.email,
        phone: updatedLoan.user.phone,
      },
      amount: Number(updatedLoan.amount),
      purpose: updatedLoan.purpose,
      term: updatedLoan.term,
      status: updatedLoan.status,
      monthlyIncome: updatedLoan.user.monthlyIncome ? Number(updatedLoan.user.monthlyIncome) : null,
      employmentStatus: updatedLoan.user.employmentStatus,
      employerName: updatedLoan.user.employerName,
      rejectionReason: updatedLoan.rejectionReason,
      createdAt: updatedLoan.createdAt.toISOString(),
      updatedAt: updatedLoan.updatedAt.toISOString(),
    };
  }
}
