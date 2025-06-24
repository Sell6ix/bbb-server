import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ApplicationValidatorService } from './application-validator.service';
import { VotingService } from './voting.service';
@Module({
  providers: [
    ApplicationsService,
    ApplicationValidatorService,
    VotingService,
  ],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
