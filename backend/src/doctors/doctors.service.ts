import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async completeProfile(userId: number, data: any) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });

    if (!doctor) throw new Error('Doctor not found');

    doctor.specialization = data.specialization;
    doctor.experience = data.experience;
    doctor.consultation_fee = data.consultation_fee;
    doctor.profile_description = data.profile_description;

    return this.doctorRepo.save(doctor);
  }
}