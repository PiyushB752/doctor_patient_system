import { Controller, Post, Patch, Param, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  bookAppointment(@Body() body: any) {
    return this.appointmentsService.bookAppointment(body);
  }

  @Patch(':id/cancel')
  cancelAppointment(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(Number(id));
  }

  @Patch(':id/reschedule')
  rescheduleAppointment(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.appointmentsService.rescheduleAppointment(
      Number(id),
      body,
    );
  }

  @Get()
  getAppointments(@Query('doctor_id') doctor_id: string) {
    if (!doctor_id) {
      throw new BadRequestException('doctor_id is required');
    }

    return this.appointmentsService.getAppointmentsByDoctor(
      Number(doctor_id),
    );
  }
}