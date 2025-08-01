import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared';

@Controller()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
