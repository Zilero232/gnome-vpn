import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';
import { describeError } from '@/common/lib';

import type { GeoKind } from '../lib';
import type { GeoFile, GeoFileSet } from '../subscription-link.service.types';

import { GEO_FILES } from '../config';
import { routingGeoTags, trimGeoList } from '../lib';

@Injectable()
export class GeoFilesService {
  private readonly logger = new Logger(GeoFilesService.name);

  private files: GeoFileSet | null = null;
  private building: Promise<GeoFileSet | null> | null = null;
  private failedAt: number | null = null;

  async get(kind: GeoKind): Promise<GeoFile> {
    const files = this.files ?? (this.isCoolingDown() ? null : await this.refresh());

    if (isNullish(files)) {
      throw new AppServiceUnavailableException('GEO_FILES_UNAVAILABLE', 'The geo files have not been built yet');
    }

    return files[kind];
  }

  refresh(): Promise<GeoFileSet | null> {
    this.building ??= this.build().finally(() => {
      this.building = null;
    });

    return this.building;
  }

  private isCoolingDown(): boolean {
    return isNonNullish(this.failedAt) && Date.now() - this.failedAt < GEO_FILES.retryCooldownMs;
  }

  private async build(): Promise<GeoFileSet | null> {
    try {
      const [geosite, geoip] = await Promise.all([this.trimmed('geosite'), this.trimmed('geoip')]);

      this.files = { geosite, geoip };
      this.failedAt = null;
      this.logger.log(`Geo files rebuilt: geosite ${geosite.data.length} B, geoip ${geoip.data.length} B`);

      return this.files;
    } catch (error) {
      this.failedAt = Date.now();
      this.logger.warn(`Geo files refresh failed, the previous copy stays: ${describeError(error)}`);

      return this.files;
    }
  }

  private async trimmed(kind: GeoKind): Promise<GeoFile> {
    const response = await fetch(GEO_FILES.upstream[kind], { signal: AbortSignal.timeout(GEO_FILES.fetchTimeoutMs) });

    if (!response.ok) {
      throw new Error(`${kind}: upstream answered ${response.status}`);
    }

    const { data, missing } = trimGeoList({ data: new Uint8Array(await response.arrayBuffer()), codes: routingGeoTags()[kind] });

    if (!isEmpty(missing)) {
      throw new Error(`${kind}: upstream has no ${missing.join(', ')}`);
    }

    return { data, sha256: createHash('sha256').update(data).digest('hex'), builtAt: new Date() };
  }
}
