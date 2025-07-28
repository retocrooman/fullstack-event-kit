import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CommandBusService {
  constructor(
    @Inject('CQRS_CONTAINER')
    private readonly cqrsContainer: any,
  ) {}

  async execute(command: any): Promise<any> {
    return await this.cqrsContainer.commandBus.send(command);
  }

  get commandBus() {
    return this.cqrsContainer.commandBus;
  }
}