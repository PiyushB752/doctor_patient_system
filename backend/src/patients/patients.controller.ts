import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('patient')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('complete-profile')
  async completeProfile(@Req() req, @Body() body) {
    return this.patientsService.completeProfile(req.user.sub, body);
  }
}