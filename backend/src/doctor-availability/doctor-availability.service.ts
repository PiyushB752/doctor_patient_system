import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorAvailability } from './doctor-availability.entity';
import { Doctor } from '../doctors/doctor.entity';

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,

    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async createAvailability(data: any) {
    const { doctor_id, availability_type, availability_date, day_of_week } = data;

    if (!doctor_id) {
      throw new BadRequestException('doctor_id is required');
    }

    const doctor = await this.doctorRepo.findOne({
      where: { doctor_id },
    });

    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }

    if (availability_type === 'custom') {
      if (!availability_date) {
        throw new BadRequestException(
          'availability_date is required for custom type',
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inputDate = new Date(availability_date);

      if (inputDate < today) {
        throw new BadRequestException(
          'Availability date cannot be in the past',
        );
      }
    }

    if (availability_type === 'stream' || availability_type === 'wave') {
      if (day_of_week === undefined || day_of_week === null) {
        throw new BadRequestException(
          'day_of_week is required for stream and wave type',
        );
      }

      if (day_of_week < 0 || day_of_week > 6) {
        throw new BadRequestException(
          'day_of_week must be between 0 and 6',
        );
      }
    }

    const availability = this.availabilityRepo.create({
      doctor_id,
      ...data,
    });

    return this.availabilityRepo.save(availability);
  }
}