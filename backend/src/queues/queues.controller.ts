import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { Rights } from '../auth/decorators/Rights.decorator';
import { RightsEnum } from '../users/entities/Enums/rights.enum';
import { RightsGuard } from '../auth/guards/rights.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Queue } from './entities/queue.entity';

@ApiTags('queues')
@Controller('queues')
@UseGuards(AuthGuard)
export class QueuesController {
    constructor(private readonly queuesService: QueuesService) {}

    @Post()
    @Rights([RightsEnum.ChangeTv])
    @UseGuards(RightsGuard)
    @ApiResponse({
        type: Queue,
        description: 'Add new queue',
    })
    async create(@Body() createQueueDto: CreateQueueDto) {
        return await this.queuesService.create(createQueueDto);
    }

    @Get()
    @ApiResponse({
        type: [Queue],
        description: 'Get all queues',
    })
    async findAll() {
        return await this.queuesService.findAll();
    }
}
