import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from './common/config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.port;

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Cookie Parser
  app.use(cookieParser());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API Versioning Configuration
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Global Route Prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('QuickFund API')
    .setDescription('QuickFund micro-lending platform API')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management and profile operations')
    .addTag('Loans', 'Loan application and management')
    .addTag('Virtual Accounts', 'Virtual account operations')
    .addTag('Notifications', 'User notification management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Development server')
    .addServer('https://api.quickfund.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'QuickFund API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; }
    `,
  });

  await app.listen(port);
  console.log(`🚀 QuickFund API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(
    `🔒 Security: Enhanced with session management, CSRF protection, and XSS prevention`,
  );
  console.log(`📊 API Versioning: Enabled with URI versioning (v1, v2, etc.)`);
  console.log(`🌐 Global Prefix: All routes prefixed with /api`);
}
bootstrap();
