export { DEVICE_HEADER, DEVICE_KEY, DEVICE_ORDER, DEVICE_PEER, DEVICE_TITLE } from './config';
export { DevicesModule } from './devices.module';
export type { AdmittedDevice, SurplusRevocation } from './devices.types';
export {
  deviceIdentity,
  deviceIpLimit,
  devicePeerName,
  deviceTitle,
  headerOf,
  incyAgent,
  isKeylessIncy,
  isWireguardDevice
} from './lib/device-identity';
export type { DeviceHeaders, DeviceIdentity } from './lib/device-identity';
export { DeviceLimitService } from './services/device-limit.service';
export { DevicesService } from './services/devices.service';
