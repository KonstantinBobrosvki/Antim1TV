import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { QueuesService } from './queues.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { Rights } from '../auth/decorators/Rights.decorator';
import { RightsEnum } from '../users/Models/Enums/rights.enum';
import { RightsGuard } from '../auth/guards/rights.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('queues')
@Controller('queues')
@UseGuards(AuthGuard)
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Post()
  @Rights([RightsEnum.ControllPlayer])
  @UseGuards(RightsGuard)
  async create(@Body() createQueueDto: CreateQueueDto) {
    return await this.queuesService.create(createQueueDto);
  }

  @Get()
  async findAll() {
    return await this.queuesService.findAll();
  }
}
