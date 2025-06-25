import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { LoansController } from './controllers/loans.controller';
import { LoansService } from './services/loans.service';
import { ScoringService } from './services/scoring.service';
import { LoanScoringProcessor } from './processors/loan-scoring.processor';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'loan-scoring',
    }),
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [LoansController],
  providers: [LoansService, ScoringService, LoanScoringProcessor],
  exports: [LoansService, ScoringService],
})
export class LoansModule {}
