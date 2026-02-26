import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAvailability } from '../doctor-availability/doctor-availability.entity';

interface SlotResponse {
  start_time: string;
  end_time: string;
  reporting_time: string;
  remaining_capacity: number;
}

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,
  ) {}

  async getSlots(
    doctorId: number,
    date: string,
  ): Promise<SlotResponse[]> {
    if (!doctorId) {
      throw new BadRequestException('doctor_id is required');
    }

    if (!date) {
      throw new BadRequestException('date is required');
    }

    const inputDate = new Date(date);
    const dayOfWeek = inputDate.getDay();
    const dateObject = new Date(date);

    const availabilities = await this.availabilityRepo.find({
      where: [
        {
          doctor_id: doctorId,
          availability_type: 'custom',
          availability_date: dateObject,
        },
        {
          doctor_id: doctorId,
          availability_type: 'stream',
          day_of_week: dayOfWeek,
        },
        {
          doctor_id: doctorId,
          availability_type: 'wave',
          day_of_week: dayOfWeek,
        },
      ],
    });

    const slots: SlotResponse[] = [];

    for (const availability of availabilities) {
    const start = this.convertToMinutes(availability.start_time);
    const end = this.convertToMinutes(availability.end_time);

    if (availability.availability_type === 'wave') {
        const slotStart = this.convertToHHMM(start);
        const slotEnd = this.convertToHHMM(end);

        const reportingMinutes = start - 10;
        const reportingTime =
        reportingMinutes >= 0
            ? this.convertToHHMM(reportingMinutes)
            : slotStart;

        slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        reporting_time: reportingTime,
        remaining_capacity: availability.capacity,
        });

        continue; 
    }

    if (
        availability.availability_type === 'stream' ||
        availability.availability_type === 'custom'
    ) {
        if (!availability.duration) continue;

        const duration = availability.duration;

        for (let time = start; time + duration <= end; time += duration) {
        const slotStart = this.convertToHHMM(time);
        const slotEnd = this.convertToHHMM(time + duration);

        const reportingMinutes = time - 10;
        const reportingTime =
            reportingMinutes >= 0
            ? this.convertToHHMM(reportingMinutes)
            : slotStart;

        slots.push({
            start_time: slotStart,
            end_time: slotEnd,
            reporting_time: reportingTime,
            remaining_capacity: availability.capacity,
        });
        }
    }
    }

    return slots;
  }

  private convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private convertToHHMM(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');

    return `${h}:${m}`;
  }
}