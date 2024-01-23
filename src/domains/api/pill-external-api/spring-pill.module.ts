import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../../../../config/configuration';
import { SpringPillService } from './spring-pill.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
  ],
  providers: [SpringPillService],
  exports: [SpringPillService],
})
export class SpringPillModule {}
