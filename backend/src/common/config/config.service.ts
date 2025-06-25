import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.interface';

@Injectable()
export class ConfigService implements Config {
  constructor(private configService: NestConfigService) {}

  // Database Configuration
  get database() {
    return {
      url:
        this.configService.get<string>('DATABASE_URL') ||
        'postgresql://localhost:5432/quickfund',
    };
  }

  get databaseUrl(): string {
    return this.database.url;
  }

  // JWT Configuration
  get jwt() {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return {
      secret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    };
  }

  get jwtSecret(): string {
    return this.jwt.secret;
  }

  get jwtExpiresIn(): string {
    return this.jwt.expiresIn;
  }

  // Application Configuration
  get app() {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    return {
      port: this.configService.get<number>('PORT') || 3000,
      nodeEnv,
      name: this.configService.get<string>('APP_NAME') || 'QuickFund',
      version: this.configService.get<string>('APP_VERSION') || '1.0.0',
      isDevelopment: nodeEnv === 'development',
      isProduction: nodeEnv === 'production',
    };
  }

  get port(): number {
    return this.app.port;
  }

  get nodeEnv(): string {
    return this.app.nodeEnv;
  }

  get isDevelopment(): boolean {
    return this.app.isDevelopment;
  }

  get isProduction(): boolean {
    return this.app.isProduction;
  }

  // Email Configuration
  get email() {
    return {
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      user: this.configService.get<string>('SMTP_USER') || '',
      pass: this.configService.get<string>('SMTP_PASS') || '',
    };
  }

  get smtpHost(): string {
    return this.email.host;
  }

  get smtpUser(): string {
    return this.email.user;
  }

  get smtpPass(): string {
    return this.email.pass;
  }

  // Redis Configuration
  get redis() {
    return {
      url:
        this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
    };
  }

  get redisUrl(): string {
    return this.redis.url;
  }

  // App Configuration
  get appName(): string {
    return this.app.name;
  }

  get appVersion(): string {
    return this.app.version;
  }

  // Security Configuration
  get security() {
    return {
      bcryptRounds: this.configService.get<number>('BCRYPT_ROUNDS') || 10,
    };
  }

  get bcryptRounds(): number {
    return this.security.bcryptRounds;
  }

  // Rate Limiting
  get rateLimit() {
    return {
      ttl: this.configService.get<number>('RATE_LIMIT_TTL') || 60,
      limit: this.configService.get<number>('RATE_LIMIT_LIMIT') || 100,
    };
  }

  get rateLimitTtl(): number {
    return this.rateLimit.ttl;
  }

  get rateLimitLimit(): number {
    return this.rateLimit.limit;
  }
}
