import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SlotsService } from './slots.service';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  async getSlots(
    @Query('doctor_id') doctorId: string,
    @Query('date') date: string,
  ): Promise<
    {
      start_time: string;
      end_time: string;
      reporting_time: string;
      remaining_capacity: number;
    }[]
  > {
    if (!doctorId) {
      throw new BadRequestException('doctor_id is required');
    }

    if (!date) {
      throw new BadRequestException('date is required');
    }

    return this.slotsService.getSlots(Number(doctorId), date);
  }
}