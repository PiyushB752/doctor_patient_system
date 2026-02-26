import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('doctor')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('complete-profile')
  async completeProfile(@Req() req, @Body() body) {
    return this.doctorsService.completeProfile(req.user.sub, body);
  }
}