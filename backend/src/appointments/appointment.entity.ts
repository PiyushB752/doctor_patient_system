import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('appointments')
@Index(['doctor_id', 'appointment_date', 'appointment_time'])
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

  @Column()
  doctor_id: number;

  @Column()
  patient_id: number;

  @Column({ type: 'date' })
  appointment_date: string;

  @Column({ type: 'time' })
  appointment_time: string;

  @Column({ default: 'booked' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}