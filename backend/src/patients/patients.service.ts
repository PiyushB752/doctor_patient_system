import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async completeProfile(userId: number, data: any) {
    const patient = await this.patientRepo.findOne({
      where: {
        user: { user_id: userId },
      },
      relations: ['user'],
    });

    if (!patient) {
      throw new Error('Patient record not found for this user');
    }

    patient.gender = data.gender;
    patient.date_of_birth = data.date_of_birth;

    return await this.patientRepo.save(patient);
  }
}