import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return { data: { status: 'ok', service: 'Fulltime API', uptime: process.uptime() } };
  }
}
