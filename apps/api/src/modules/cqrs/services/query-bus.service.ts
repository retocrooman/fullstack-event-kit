import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class QueryBusService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  // Query bus methods for read operations
  // This can be extended with more sophisticated query handling
  get prisma() {
    return this.prismaService;
  }
}