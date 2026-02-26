import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { SlotsService } from '../slots/slots.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    private slotsService: SlotsService,
  ) {}

  async bookAppointment(body: any) {
    const {
      doctor_id,
      patient_id,
      appointment_date,
      appointment_time,
    } = body;

    if (!doctor_id || !patient_id || !appointment_date || !appointment_time) {
      throw new BadRequestException('All fields are required');
    }

    const slots = await this.slotsService.getSlots(
      Number(doctor_id),
      appointment_date,
    );

    const selectedSlot = slots.find(
      (slot) => slot.start_time === appointment_time,
    );

    if (!selectedSlot) {
      throw new BadRequestException('Invalid or unavailable slot');
    }

    const existingCount = await this.appointmentRepo.count({
      where: {
        doctor_id,
        appointment_date,
        appointment_time,
        status: 'booked',
      },
    });

    if (existingCount >= selectedSlot.remaining_capacity) {
      throw new BadRequestException('Slot is fully booked');
    }

    const alreadyBooked = await this.appointmentRepo.findOne({
      where: {
        doctor_id,
        patient_id,
        appointment_date,
        appointment_time,
        status: 'booked',
      },
    });

    if (alreadyBooked) {
      throw new BadRequestException(
        'You already have an appointment for this slot',
      );
    }

    const appointment = this.appointmentRepo.create({
      doctor_id,
      patient_id,
      appointment_date,
      appointment_time,
      status: 'booked',
    });

    return await this.appointmentRepo.save(appointment);
  }

  async cancelAppointment(id: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { appointment_id: id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== 'booked') {
      throw new BadRequestException(
        'Only booked appointments can be cancelled',
      );
    }

    appointment.status = 'cancelled';

    return await this.appointmentRepo.save(appointment);
  }

  async rescheduleAppointment(id: number, body: any) {
    const { appointment_date, appointment_time } = body;

    if (!appointment_date || !appointment_time) {
      throw new BadRequestException(
        'appointment_date and appointment_time are required',
      );
    }

    const appointment = await this.appointmentRepo.findOne({
      where: { appointment_id: id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== 'booked') {
      throw new BadRequestException(
        'Only booked appointments can be rescheduled',
      );
    }

    const slots = await this.slotsService.getSlots(
      appointment.doctor_id,
      appointment_date,
    );

    const selectedSlot = slots.find(
      (slot) => slot.start_time === appointment_time,
    );

    if (!selectedSlot) {
      throw new BadRequestException('Invalid or unavailable slot');
    }

    const existingCount = await this.appointmentRepo.count({
      where: {
        doctor_id: appointment.doctor_id,
        appointment_date,
        appointment_time,
        status: 'booked',
      },
    });

    if (existingCount >= selectedSlot.remaining_capacity) {
      throw new BadRequestException('Slot is fully booked');
    }

    appointment.appointment_date = appointment_date;
    appointment.appointment_time = appointment_time;

    return await this.appointmentRepo.save(appointment);
  }

  async getAppointmentsByDoctor(doctor_id: number) {
    return this.appointmentRepo.find({
        where: { doctor_id },
        order: { appointment_date: 'ASC', appointment_time: 'ASC' },
        });
    }
}