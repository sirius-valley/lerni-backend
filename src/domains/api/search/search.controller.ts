import { Controller, Get, Query, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiRequest } from '../../../types/api-request.interface';
import { AttachStudentDataInterceptor } from 'src/interceptors/attach-student-data.interceptor';
import { SearchService } from './search.service';

@Controller('api/search')
@UseGuards(JwtGuard)
@UseInterceptors(AttachStudentDataInterceptor)
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('')
  async search(@Request() req: ApiRequest, @Query() query: any) {
    const { page, filter, search } = query as Record<string, string>;
    return await this.searchService.search(req.user, search, filter, Number(page));
  }
}
