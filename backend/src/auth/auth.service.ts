import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/user.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Patient } from '../patients/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(
    userData: { email?: string; name?: string },
    role: 'doctor' | 'patient',
  ) {
    if (!userData?.email) {
      throw new Error('Google login did not provide an email');
    }

    // 1️⃣ Check if user exists
    let user = await this.userRepo.findOne({
      where: { email: userData.email },
    });

    // 2️⃣ Create user if not exists
    if (!user) {
      const newUser = new User();
      newUser.email = userData.email;
      newUser.name = userData.name ?? 'No Name';
      newUser.role = role;

      user = await this.userRepo.save(newUser);

      // 3️⃣ Create role-based record
      if (role === 'doctor') {
        const doctor = new Doctor();
        doctor.user = user;
        await this.doctorRepo.save(doctor);
      } else {
        const patient = new Patient();
        patient.user = user;
        await this.patientRepo.save(patient);
      }
    } else {
      // 4️⃣ Optional: allow role switching
      if (user.role !== role) {
        user.role = role;
        await this.userRepo.save(user);
      }
    }

    // 5️⃣ Create JWT
    const payload = {
      sub: user.user_id, // based on your entity
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user,
    };
  }
}