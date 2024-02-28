import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { StudentModule } from '../student/student.module';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repository';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController],
  imports: [StudentModule],
  providers: [PrismaService, SearchService, SearchRepository],
  exports: [SearchService, SearchRepository],
})
export class SearchModule {}
