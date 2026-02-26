import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    const role =
      typeof req.query.state === 'string'
        ? (req.query.state as 'doctor' | 'patient')
        : 'patient';

    console.log('ROLE FROM STATE:', role);

    const result = await this.authService.googleLogin(
      req.user,
      role,
    );

    return res.redirect(
      `http://localhost:5000/${role}.html?token=${result.access_token}`
    );
  }
}