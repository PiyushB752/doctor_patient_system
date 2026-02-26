import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  doctor_id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  experience: number;

  @Column({ nullable: true })
  consultation_fee: number;

  @Column({ nullable: true })
  profile_description: string;
}