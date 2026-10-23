import type { Response } from 'express';

import { Controller, Get, Param, Res } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { isNullish } from 'remeda';

import { AppNotFoundException } from '../../common/exceptions';
import { GEO_FILES } from './config';
import { geoFileTarget } from './lib';
import { GeoFilesService } from './services';

@Controller(GEO_FILES.route)
export class GeoFilesController {
  constructor(private readonly geoFiles: GeoFilesService) {}

  @AllowAnonymous()
  @Get(':name')
  async serve(@Param('name') name: string, @Res() res: Response): Promise<void> {
    const target = geoFileTarget(name);

    if (isNullish(target)) {
      throw new AppNotFoundException('NOT_FOUND', 'Unknown geo file');
    }

    const file = await this.geoFiles.get(target.kind);

    res
      .type(target.isSidecar ? GEO_FILES.contentType.sidecar : GEO_FILES.contentType.data)
      .set({ 'cache-control': GEO_FILES.cacheControl, etag: `"${file.sha256}"`, 'last-modified': file.builtAt.toUTCString() })
      .send(target.isSidecar ? file.sha256 : file.data);
  }
}
