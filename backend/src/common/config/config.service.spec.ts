import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: 'ConfigService',
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '1d',
                PORT: '3001',
                NODE_ENV: 'test',
                APP_NAME: 'TestApp',
                APP_VERSION: '1.0.0',
                SMTP_HOST: 'smtp.test.com',
                SMTP_USER: 'test@test.com',
                SMTP_PASS: 'test-pass',
                REDIS_URL: 'redis://localhost:6379',
                BCRYPT_ROUNDS: '12',
                RATE_LIMIT_TTL: '30',
                RATE_LIMIT_LIMIT: '50',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return database configuration', () => {
    expect(service.databaseUrl).toBe(
      'postgresql://test:test@localhost:5432/test',
    );
  });

  it('should return JWT configuration', () => {
    expect(service.jwtSecret).toBe('test-secret');
    expect(service.jwtExpiresIn).toBe('1d');
  });

  it('should return app configuration', () => {
    expect(service.port).toBe(3001);
    expect(service.nodeEnv).toBe('test');
    expect(service.appName).toBe('TestApp');
    expect(service.appVersion).toBe('1.0.0');
  });

  it('should return email configuration', () => {
    expect(service.smtpHost).toBe('smtp.test.com');
    expect(service.smtpUser).toBe('test@test.com');
    expect(service.smtpPass).toBe('test-pass');
  });

  it('should return security configuration', () => {
    expect(service.bcryptRounds).toBe(12);
  });

  it('should return rate limit configuration', () => {
    expect(service.rateLimitTtl).toBe(30);
    expect(service.rateLimitLimit).toBe(50);
  });
});
