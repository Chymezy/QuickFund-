import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { VirtualAccountService } from './services/virtual-account.service';
import { PaymentReminderService } from './services/payment-reminder.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, VirtualAccountService, PaymentReminderService],
  exports: [PaymentsService, VirtualAccountService, PaymentReminderService],
})
export class PaymentsModule {}
