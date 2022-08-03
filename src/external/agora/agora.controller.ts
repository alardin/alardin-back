import { Controller, UseGuards } from '@nestjs/common';
import { InternalGuard } from 'src/common/guards/internal.guard';

@UseGuards(InternalGuard)
@Controller('agora')
export class AgoraController {}
