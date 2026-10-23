import { Module } from '@nestjs/common';

import { ConsentsController } from './consents.controller';
import { ConsentService, UnsubscribeService } from './services';

@Module({
  controllers: [ConsentsController],
  providers: [ConsentService, UnsubscribeService],
  exports: [ConsentService, UnsubscribeService]
})
export class ConsentsModule {}
