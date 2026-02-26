import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('doctor_availability')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  availability_id: number;

  @Column()
  doctor_id: number;

  @Column({ type: 'int', nullable: true })
  day_of_week: number; 

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'int', nullable: true })
  duration: number; 

  @Column({
    type: 'enum',
    enum: ['custom', 'stream', 'wave'],
  })
  availability_type: 'custom' | 'stream' | 'wave';

  @Column({ type: 'date', nullable: true })
  availability_date: Date;

  @CreateDateColumn()
  created_at: Date;
}