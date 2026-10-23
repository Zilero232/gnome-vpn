import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GeoFilesService } from '../../../subscription-link';
import { SCHEDULE } from '../../config';

@Injectable()
export class GeoFilesJob {
  constructor(private readonly geoFiles: GeoFilesService) {}

  @Cron(SCHEDULE.geoFilesCron)
  async run(): Promise<void> {
    await this.geoFiles.refresh();
  }
}
