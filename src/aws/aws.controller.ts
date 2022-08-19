import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AwsService } from './aws.service';

@Controller('/api/aws')
export class AwsController {
    constructor(
        private readonly awsService: AwsService
    ) {}
    @Public()
    @Get()
    async test() {
        await this.awsService.getObject('alardin-static', 'images/test2');
        return 'hi';
    }
}
