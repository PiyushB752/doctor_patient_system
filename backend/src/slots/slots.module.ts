import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsService } from './slots.service';
import { SlotsController } from './slots.controller';
import { DoctorAvailability } from '../doctor-availability/doctor-availability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorAvailability,
    ]),
  ],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService], 
})
export class SlotsModule {}