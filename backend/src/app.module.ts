import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { Doctor } from './doctors/doctor.entity';
import { Patient } from './patients/patient.entity';
import { DoctorAvailability } from './doctor-availability/doctor-availability.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorAvailabilityModule } from './doctor-availability/doctor-availability.module';
import { SlotsModule } from './slots/slots.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { Appointment } from './appointments/appointment.entity';

console.log("ENV CHECK:", process.env.DATABASE_URL);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [
          User,
          Doctor,
          Patient,
          DoctorAvailability,
          Appointment
        ],
        synchronize: false,
        ssl:{
          rejectUnauthorized: false
        }
      }),
    }),
    AuthModule,
    DoctorsModule,
    PatientsModule,
    DoctorAvailabilityModule,
    SlotsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}