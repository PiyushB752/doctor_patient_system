import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private dataSource: DataSource) {}

  @Get('hello')
  getHello(): string {
    return 'Hello, Doctor-Patient System!';
  }

  @Get('db_status')
  async getDbStatus() {
    if (this.dataSource.isInitialized) {
      return { status: 'Database connected successfully ✅' };
    } else {
      return { status: 'Database not connected ❌' };
    }
  }
}