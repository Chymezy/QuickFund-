import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AdminController } from './controllers/admin.controller';
import { LoansModule } from '../loans/loans.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'loan-scoring',
    }),
    LoansModule,
    NotificationsModule,
    PrismaModule,
    PaymentsModule,
  ],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class AdminModule {}
