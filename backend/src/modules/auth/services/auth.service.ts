import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ConfigService } from '../../../common/config';
import { SessionService } from './session.service';
import { NotificationService } from '../../notifications/services/notification.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, EmploymentStatus } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  AuthResponseDto,
  RegisterResponseDto,
  ProfileResponseDto,
} from '../dto/auth-response.dto';
import { Request } from 'express';
import { ROLE_PERMISSIONS } from '../../../common/constants/roles.constant';
import { GeneratorUtil } from '../../../common/utils/generator.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionService: SessionService,
    private notificationService: NotificationService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, agreeToTerms, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate terms agreement for micro-lending
    if (!agreeToTerms) {
      throw new BadRequestException(
        'You must agree to the terms and conditions to register',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.bcryptRounds,
    );

    // Create user with default values for micro-lending
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth)
          : null,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        zipCode: userData.zipCode,
        country: userData.country || 'Nigeria',
        employmentStatus: userData.employmentStatus,
        employerName: userData.employerName,
        monthlyIncome: userData.monthlyIncome
          ? parseFloat(userData.monthlyIncome.toString())
          : null,
        role: 'USER',
        isActive: true,
        isVerified: false, // Will be verified through email/SMS
      },
    });

    // Create virtual account for the user
    await this.prisma.virtualAccount.create({
      data: {
        userId: user.id,
        accountNumber: GeneratorUtil.generateAccountNumber(),
        bankName: 'QuickFund Bank',
        balance: 0,
      },
    });

    // Generate temporary JWT token for session creation
    const tempToken = this.generateToken(user);

    // Create session with proper parameters
    const session = await this.sessionService.createSession(
      user.id,
      'web', // deviceId
      '127.0.0.1', // ipAddress
      'Mozilla/5.0', // userAgent
      tempToken, // refreshToken
      tempToken, // accessToken
      user.role,
      ROLE_PERMISSIONS[user.role] || [],
    );

    // Generate final JWT token with session ID
    const token = this.generateToken(user, session.id);

    // Send welcome notification (email + in-app + admin notification)
    try {
      await this.notificationService.sendWelcomeNotification(user.id, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send welcome notification:', error);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // First, try to find user in the user table
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If not found in user table, check admin table
    if (!user) {
      const admin = await this.prisma.admin.findUnique({
        where: { email },
      });
      
      if (admin) {
        // Check if admin is active
        if (!admin.isActive) {
          throw new UnauthorizedException('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }

        // Convert admin to user-like object for session creation
        user = {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          isActive: admin.isActive,
          password: admin.password, // This won't be used after verification
        } as any;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password (for regular users)
    if (!user.password.startsWith('$2b$')) {
      // This is a regular user, verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Generate temporary JWT token for session creation
    const tempToken = this.generateToken(user);

    // Create session with proper parameters
    const session = await this.sessionService.createSession(
      user.id,
      'web', // deviceId
      '127.0.0.1', // ipAddress
      'Mozilla/5.0', // userAgent
      tempToken, // refreshToken
      tempToken, // accessToken
      user.role,
      ROLE_PERMISSIONS[user.role] || [],
    );

    // Generate final JWT token with session ID
    const token = this.generateToken(user, session.id);

    return {
      accessToken: token,
      refreshToken: token, // Using same token for simplicity
      expiresIn: this.configService.jwtExpiresIn,
      tokenType: 'Bearer',
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.invalidateSession(sessionId);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.jwtSecret,
      });

      // First, try to find user in the user table
      let user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      // If not found in user table, check admin table
      if (!user) {
        const admin = await this.prisma.admin.findUnique({
          where: { id: payload.sub },
        });
        
        if (admin) {
          // Convert admin to user-like object for session refresh
          user = {
            id: admin.id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role,
            isActive: admin.isActive,
          } as any;
        }
      }

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if sessionId is in payload
      if (!payload.sessionId) {
        throw new UnauthorizedException('Invalid refresh token - no session ID');
      }

      // Generate new access token with session ID
      const newToken = this.generateToken(user, payload.sessionId);

      // Update session
      const session = await this.sessionService.refreshSession(
        payload.sessionId,
        newToken, // newRefreshToken
        newToken, // newAccessToken
        user.role,
        ROLE_PERMISSIONS[user.role] || [],
      );

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      return {
        accessToken: newToken,
        refreshToken: newToken,
        expiresIn: this.configService.jwtExpiresIn,
        tokenType: 'Bearer',
        sessionId: session.id,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    // First, try to find user in the user table
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        virtualAccount: true,
        loans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // If not found in user table, check admin table
    if (!user) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
      });
      
      if (admin) {
        // Convert admin to user-like object for profile response
        user = {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          isActive: admin.isActive,
          isVerified: true,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
          virtualAccount: null,
          loans: [],
        } as any;
      }
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth?.toISOString() || null,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      country: user.country,
      employmentStatus: user.employmentStatus,
      employerName: user.employerName,
      monthlyIncome: user.monthlyIncome
        ? parseFloat(user.monthlyIncome.toString())
        : null,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      virtualAccount: user.virtualAccount
        ? {
            id: user.virtualAccount.id,
            accountNumber: user.virtualAccount.accountNumber,
            bankName: user.virtualAccount.bankName,
            balance: parseFloat(user.virtualAccount.balance.toString()),
            isActive: user.virtualAccount.isActive,
          }
        : null,
      recentLoans: user.loans.map((loan) => ({
        id: loan.id,
        amount: parseFloat(loan.amount.toString()),
        purpose: loan.purpose,
        status: loan.status,
        createdAt: loan.createdAt.toISOString(),
      })),
    };
  }

  async updateProfile(
    userId: string,
    updateData: Partial<RegisterDto>,
  ): Promise<ProfileResponseDto> {
    // Remove sensitive fields that shouldn't be updated via this endpoint
    const { email, password, agreeToTerms, ...safeUpdateData } = updateData;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...safeUpdateData,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
        monthlyIncome: updateData.monthlyIncome
          ? parseFloat(updateData.monthlyIncome.toString())
          : undefined,
      },
      include: {
        virtualAccount: true,
        loans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth?.toISOString() || null,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      zipCode: updatedUser.zipCode,
      country: updatedUser.country,
      employmentStatus: updatedUser.employmentStatus,
      employerName: updatedUser.employerName,
      monthlyIncome: updatedUser.monthlyIncome
        ? parseFloat(updatedUser.monthlyIncome.toString())
        : null,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
      virtualAccount: updatedUser.virtualAccount
        ? {
            id: updatedUser.virtualAccount.id,
            accountNumber: updatedUser.virtualAccount.accountNumber,
            bankName: updatedUser.virtualAccount.bankName,
            balance: parseFloat(updatedUser.virtualAccount.balance.toString()),
            isActive: updatedUser.virtualAccount.isActive,
          }
        : null,
      recentLoans: updatedUser.loans.map((loan) => ({
        id: loan.id,
        amount: parseFloat(loan.amount.toString()),
        purpose: loan.purpose,
        status: loan.status,
        createdAt: loan.createdAt.toISOString(),
      })),
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      this.configService.bcryptRounds,
    );

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  async validateUser(userId: string) {
    // First, try to find user in the user table
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // If not found in user table, check admin table
    if (!user) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
      });
      
      if (admin) {
        // Convert admin to user-like object for validation
        user = {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          isActive: admin.isActive,
        } as any;
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private generateToken(user: any, sessionId?: string): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(sessionId && { sessionId }),
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: this.configService.jwtExpiresIn,
    });
  }
}
