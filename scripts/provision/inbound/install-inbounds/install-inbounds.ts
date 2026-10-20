import type { InstalledInbounds, InstallInboundsInput } from './install-inbounds.types';

import { log, MASQUERADE_HOST } from '../../config';
import { ensureCert, ensureRealityKeys, ensureWireguardKeys, readCertFingerprint, syncInbounds } from '../../remote';
import { buildHysteriaInbound } from '../hysteria-inbound';
import { buildRealityInbound } from '../reality-inbound';
import { buildWireguardInbound } from '../wireguard-inbound';

export const installInbounds = async ({ ssh, panel, auth }: InstallInboundsInput): Promise<InstalledInbounds> => {
  log.step('installing the inbounds');

  const cert = await ensureCert(ssh);
  const certFingerprint = await readCertFingerprint(ssh);
  const reality = await ensureRealityKeys(ssh);
  const wireguard = await ensureWireguardKeys(ssh);

  await syncInbounds({
    ...panel,
    inbounds: {
      hysteria: buildHysteriaInbound({ auth, sni: MASQUERADE_HOST }),
      vless: buildRealityInbound({ privateKey: reality.privateKey, shortId: reality.shortId }),
      wireguard: buildWireguardInbound({ secretKey: wireguard.privateKey })
    }
  });

  return {
    certFingerprint,
    certWasGenerated: cert.wasGenerated,
    realityPublicKey: reality.publicKey,
    realityShortId: reality.shortId,
    realityWasGenerated: reality.wasGenerated,
    wgPublicKey: wireguard.publicKey,
    wgWasGenerated: wireguard.wasGenerated
  };
};
